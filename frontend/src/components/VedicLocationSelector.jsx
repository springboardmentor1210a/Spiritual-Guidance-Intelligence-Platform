import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  MapPin,
  Search,
  Layers,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Globe,
  Sliders
} from 'lucide-react';
const API_BASE = import.meta.env.VITE_API_BASE_URL || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : window.location.origin
);

const VedicLocationSelector = ({
  initialLatitude = 16.5062,
  initialLongitude = 80.6480,
  initialLocationName = 'Vijayawada, Krishna, Andhra Pradesh, India',
  onLocationChange
}) => {
  // Mode: 'search' | 'hierarchy' | 'gps'
  const [mode, setMode] = useState('search');

  // Hierarchy Data from backend
  const [hierarchyData, setHierarchyData] = useState({});
  const [worldLocations, setWorldLocations] = useState([]);
  const [hierarchyLoading, setHierarchyLoading] = useState(false);

  // Cascading Selection State
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [selectedState, setSelectedState] = useState('Andhra Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState('Krishna');
  const [selectedMandal, setSelectedMandal] = useState('Vijayawada Urban');
  const [selectedPlace, setSelectedPlace] = useState('Vijayawada');

  // Active Selected Location Details
  const [activeLocation, setActiveLocation] = useState({
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Krishna',
    mandal: 'Vijayawada Urban',
    city_or_village: 'Vijayawada',
    display_name: initialLocationName || 'Vijayawada, Krishna, Andhra Pradesh, India',
    latitude: initialLatitude,
    longitude: initialLongitude,
    timezone: 'Asia/Kolkata',
    timezone_offset: 5.5,
    source: 'preset' // 'gps' | 'search' | 'hierarchy' | 'preset'
  });

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const searchTimeoutRef = useRef(null);

  // GPS State
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [gpsSuccessNotice, setGpsSuccessNotice] = useState('');

  // Coordinate Fine-tuning toggle
  const [showCoordinateTune, setShowCoordinateTune] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  // 1. Fetch Indian Hierarchy data on mount
  useEffect(() => {
    const fetchHierarchy = async () => {
      setHierarchyLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/astrology/hierarchy/india`, getAuthHeaders());
        if (res.data?.hierarchy) {
          setHierarchyData(res.data.hierarchy);
        }
        if (res.data?.world) {
          setWorldLocations(res.data.world);
        }
      } catch (err) {
        console.warn('Could not load offline hierarchy from backend:', err);
      } finally {
        setHierarchyLoading(false);
      }
    };
    fetchHierarchy();
  }, []);

  // 2. Notify parent whenever activeLocation changes
  useEffect(() => {
    if (onLocationChange) {
      onLocationChange({
        country: activeLocation.country,
        state: activeLocation.state,
        district: activeLocation.district,
        mandal: activeLocation.mandal,
        city: activeLocation.city_or_village,
        latitude: activeLocation.latitude,
        longitude: activeLocation.longitude,
        timezone: activeLocation.timezone,
        timezone_offset: activeLocation.timezone_offset,
        location_name: activeLocation.display_name,
        hierarchy: {
          country: activeLocation.country,
          state: activeLocation.state,
          district: activeLocation.district,
          mandal: activeLocation.mandal,
          city: activeLocation.city_or_village
        }
      });
    }
  }, [activeLocation]);

  // --- GPS / CURRENT LOCATION HANDLER ---
  const handleUseCurrentLocation = () => {
    setGpsLoading(true);
    setGpsError('');
    setGpsSuccessNotice('');

    if (!navigator.geolocation) {
      setGpsLoading(false);
      setGpsError('Geolocation is not supported by your browser. Please use manual search or hierarchy.');
      return;
    }

    const onGeoSuccess = async (position) => {
      const lat = parseFloat(position.coords.latitude.toFixed(5));
      const lon = parseFloat(position.coords.longitude.toFixed(5));

      try {
        // Reverse-geocode coordinates through backend proxy to guarantee structured hierarchy and no CORS issues
        const res = await axios.get(
          `${API_BASE}/astrology/reverse-geocode?lat=${lat}&lon=${lon}`,
          getAuthHeaders()
        );

        const loc = res.data?.location || {};
        const newLoc = {
          country: loc.country || 'India',
          state: loc.state || 'Detected State',
          district: loc.district || 'Detected District',
          mandal: loc.mandal || 'Detected Mandal',
          city_or_village: loc.city_or_village || `Coordinates (${lat}°, ${lon}°)`,
          display_name: loc.display_name || `Lat: ${lat}, Lon: ${lon}`,
          latitude: lat,
          longitude: lon,
          timezone: loc.timezone || 'Asia/Kolkata',
          timezone_offset: loc.timezone_offset || 5.5,
          source: 'gps'
        };

        setActiveLocation(newLoc);
        setGpsSuccessNotice(`GPS Detected: ${newLoc.city_or_village}, ${newLoc.state} (${lat}°, ${lon}°)`);
        setMode('gps');
      } catch (err) {
        // Safe fallback if geocoding fails
        setActiveLocation((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lon,
          display_name: `GPS Coordinates (${lat}°, ${lon}°)`,
          source: 'gps'
        }));
        setGpsSuccessNotice(`GPS Location Acquired: Lat ${lat}°, Lon ${lon}°`);
      } finally {
        setGpsLoading(false);
      }
    };

    const onGeoError = (err) => {
      console.warn('High accuracy geolocation failed, retrying with standard accuracy...', err);
      // Fallback: retry with relaxed accuracy and cached position
      navigator.geolocation.getCurrentPosition(
        onGeoSuccess,
        (fallbackErr) => {
          setGpsLoading(false);
          let msg = 'Could not acquire GPS position.';
          if (fallbackErr.code === 1) {
            msg = 'Location permission was denied. Please allow location access in your browser or select your place below.';
          } else if (fallbackErr.code === 2) {
            msg = 'Location unavailable on your network. Please use manual search or hierarchy selection below.';
          } else if (fallbackErr.code === 3) {
            msg = 'Location request timed out. Please try again or search manually.';
          }
          setGpsError(msg);
          // Auto-fallback to search mode so the user is never stuck
          setMode('search');
        },
        { enableHighAccuracy: false, maximumAge: 300000, timeout: 12000 }
      );
    };

    // Try high accuracy first
    navigator.geolocation.getCurrentPosition(
      onGeoSuccess,
      onGeoError,
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  // --- SEARCH HANDLER ---
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setSearchError('');

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (val.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/astrology/search-locations?query=${encodeURIComponent(val.trim())}`,
          getAuthHeaders()
        );
        const list = res.data?.results || [];
        setSearchResults(list);
        if (list.length === 0) {
          setSearchError('No matching locations found. Try entering your town, district, or mandal.');
        }
      } catch (err) {
        setSearchError('Failed to search locations. Please use hierarchy selection.');
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  const handleSelectSearchResult = (item) => {
    const newLoc = {
      country: item.country || 'India',
      state: item.state || '',
      district: item.district || '',
      mandal: item.mandal || '',
      city_or_village: item.city_or_village || '',
      display_name: item.display_name,
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone || 'Asia/Kolkata',
      timezone_offset: item.timezone_offset || 5.5,
      source: 'search'
    };
    setActiveLocation(newLoc);
    setSearchQuery('');
    setSearchResults([]);
    setGpsSuccessNotice(`Selected via Search: ${newLoc.city_or_village}, ${newLoc.state}`);
  };

  // --- HIERARCHY CASCADING SELECTION HANDLERS ---
  const handleHierarchyStateChange = (st) => {
    setSelectedState(st);
    const districts = hierarchyData[st]?.districts || {};
    const firstDist = Object.keys(districts)[0] || '';
    setSelectedDistrict(firstDist);

    if (firstDist && districts[firstDist]) {
      const mandals = districts[firstDist].mandals || {};
      const firstMandal = Object.keys(mandals)[0] || '';
      setSelectedMandal(firstMandal);

      if (firstMandal && mandals[firstMandal]) {
        const places = mandals[firstMandal].places || [];
        const firstPlace = places[0] || firstMandal;
        setSelectedPlace(firstPlace);

        applyHierarchyChoice(st, firstDist, firstMandal, firstPlace, mandals[firstMandal]);
      }
    }
  };

  const handleHierarchyDistrictChange = (dist) => {
    setSelectedDistrict(dist);
    const districts = hierarchyData[selectedState]?.districts || {};
    const mandals = districts[dist]?.mandals || {};
    const firstMandal = Object.keys(mandals)[0] || '';
    setSelectedMandal(firstMandal);

    if (firstMandal && mandals[firstMandal]) {
      const places = mandals[firstMandal].places || [];
      const firstPlace = places[0] || firstMandal;
      setSelectedPlace(firstPlace);

      applyHierarchyChoice(selectedState, dist, firstMandal, firstPlace, mandals[firstMandal]);
    }
  };

  const handleHierarchyMandalChange = (man) => {
    setSelectedMandal(man);
    const districts = hierarchyData[selectedState]?.districts || {};
    const mandalObj = districts[selectedDistrict]?.mandals[man] || {};
    const places = mandalObj.places || [];
    const firstPlace = places[0] || man;
    setSelectedPlace(firstPlace);

    applyHierarchyChoice(selectedState, selectedDistrict, man, firstPlace, mandalObj);
  };

  const handleHierarchyPlaceChange = (place) => {
    setSelectedPlace(place);
    const districts = hierarchyData[selectedState]?.districts || {};
    const mandalObj = districts[selectedDistrict]?.mandals[selectedMandal] || {};
    applyHierarchyChoice(selectedState, selectedDistrict, selectedMandal, place, mandalObj);
  };

  const applyHierarchyChoice = (st, dist, man, place, mandalObj) => {
    const lat = mandalObj?.lat || 16.5062;
    const lon = mandalObj?.lon || 80.6480;
    const tz = hierarchyData[st]?.timezone || 'Asia/Kolkata';
    const offset = hierarchyData[st]?.offset || 5.5;

    const newLoc = {
      country: 'India',
      state: st,
      district: dist,
      mandal: man,
      city_or_village: place,
      display_name: `${place}, ${man}, ${dist}, ${st}, India`,
      latitude: lat,
      longitude: lon,
      timezone: tz,
      timezone_offset: offset,
      source: 'hierarchy'
    };
    setActiveLocation(newLoc);
    setGpsSuccessNotice(`Selected: ${place}, ${dist} (${lat}°, ${lon}°)`);
  };

  const handleWorldSelect = (w) => {
    const newLoc = {
      country: w.country,
      state: w.state,
      district: w.district,
      mandal: w.mandal,
      city_or_village: w.city,
      display_name: `${w.city}, ${w.state}, ${w.country}`,
      latitude: w.lat,
      longitude: w.lon,
      timezone: w.timezone,
      timezone_offset: w.offset,
      source: 'hierarchy'
    };
    setActiveLocation(newLoc);
    setGpsSuccessNotice(`Selected: ${w.city}, ${w.country}`);
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.65)',
      border: '1px solid rgba(251, 191, 36, 0.25)',
      borderRadius: '16px',
      padding: '1.25rem',
      marginBottom: '1.5rem',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
    }}>
      {/* Header & Mode Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={20} style={{ color: '#fbbf24' }} />
          <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#f8fafc' }}>
            Birth Place / Geolocation Hierarchy
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '3px', borderRadius: '10px' }}>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={gpsLoading}
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'gps' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
              color: mode === 'gps' ? '#38bdf8' : '#94a3b8',
              fontSize: '0.78rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            title="Detect your current location using device GPS"
          >
            {gpsLoading ? <Loader2 size={13} className="spinner-ring" /> : <MapPin size={13} />}
            <span>{gpsLoading ? 'Detecting...' : 'Use Current GPS'}</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('search')}
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'search' ? 'rgba(251, 191, 36, 0.25)' : 'transparent',
              color: mode === 'search' ? '#fbbf24' : '#94a3b8',
              fontSize: '0.78rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Search size={13} />
            <span>Search Place</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('hierarchy')}
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'hierarchy' ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
              color: mode === 'hierarchy' ? '#c084fc' : '#94a3b8',
              fontSize: '0.78rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Layers size={13} />
            <span>Hierarchy (India)</span>
          </button>
        </div>
      </div>

      {/* GPS Status Notices */}
      {gpsError && (
        <div style={{
          padding: '0.6rem 0.85rem',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#f87171',
          fontSize: '0.8rem',
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertTriangle size={15} style={{ flexShrink: 0 }} />
          <span>{gpsError}</span>
        </div>
      )}

      {/* MODE 1: SEARCH PLACE */}
      {mode === 'search' && (
        <div style={{ marginBottom: '1rem', position: 'relative' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
            Type any Village, Mandal, District, City, or Town:
          </label>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="e.g., Guntur, Tenali, Vijayawada, Hyderabad, Hitec City, Pune, Varanasi..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '0.65rem 1rem 0.65rem 2.4rem',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
            {isSearching && (
              <Loader2 size={16} className="spinner-ring" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#fbbf24' }} />
            )}
          </div>

          {searchError && (
            <div style={{ fontSize: '0.78rem', color: '#fbbf24', marginTop: '4px' }}>
              {searchError}
            </div>
          )}

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 30,
              marginTop: '4px',
              maxHeight: '220px',
              overflowY: 'auto',
              background: '#090d16',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '10px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.8)'
            }}>
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSearchResult(item)}
                  style={{
                    padding: '0.65rem 1rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(251, 191, 36, 0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ color: '#f8fafc', fontWeight: '600', fontSize: '0.85rem' }}>
                    {item.city_or_village}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px' }}>
                    {item.mandal && `Mandal: ${item.mandal} • `}
                    {item.district && `Dist: ${item.district} • `}
                    {item.state}, {item.country} (Lat: {item.latitude}°, Lon: {item.longitude}°)
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODE 2: MULTI-LEVEL HIERARCHY SELECTOR */}
      {mode === 'hierarchy' && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
            {/* Level 1: Country */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                1. Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '8px',
                  background: '#090d16',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              >
                <option value="India">India</option>
                <option value="International">International</option>
              </select>
            </div>

            {selectedCountry === 'India' ? (
              <>
                {/* Level 2: State */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                    2. State
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => handleHierarchyStateChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      background: '#090d16',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  >
                    {Object.keys(hierarchyData).map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* Level 3: District */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                    3. District
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => handleHierarchyDistrictChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      background: '#090d16',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  >
                    {Object.keys(hierarchyData[selectedState]?.districts || {}).map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>

                {/* Level 4: Mandal / Taluk / Tehsil */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                    4. Mandal / Taluk
                  </label>
                  <select
                    value={selectedMandal}
                    onChange={(e) => handleHierarchyMandalChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      background: '#090d16',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  >
                    {Object.keys(hierarchyData[selectedState]?.districts[selectedDistrict]?.mandals || {}).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Level 5: Town / Village / Locality */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                    5. Town / Village
                  </label>
                  <select
                    value={selectedPlace}
                    onChange={(e) => handleHierarchyPlaceChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      background: '#090d16',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  >
                    {(hierarchyData[selectedState]?.districts[selectedDistrict]?.mandals[selectedMandal]?.places || [selectedMandal]).map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                  Major International Hubs
                </label>
                <select
                  onChange={(e) => {
                    const found = worldLocations.find((w) => w.city === e.target.value);
                    if (found) handleWorldSelect(found);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    background: '#090d16',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                >
                  <option value="">-- Choose City --</option>
                  {worldLocations.map((w) => (
                    <option key={w.city} value={w.city}>
                      {w.city}, {w.country} ({w.lat}°, {w.lon}°)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONFIRMED SELECTED LOCATION SUMMARY CARD (REQUIREMENTS 6, 7, 8) */}
      <div style={{
        padding: '0.85rem 1rem',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.6), rgba(15, 23, 42, 0.8))',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} style={{ color: '#34d399' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f8fafc' }}>
              Confirmed Birth Location:
            </span>
            <span style={{
              fontSize: '0.7rem',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: '600',
              textTransform: 'uppercase',
              background: activeLocation.source === 'gps' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(251, 191, 36, 0.2)',
              color: activeLocation.source === 'gps' ? '#38bdf8' : '#fbbf24'
            }}>
              {activeLocation.source === 'gps' ? 'GPS Active' : activeLocation.source === 'search' ? 'Searched' : 'Hierarchy Selected'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowCoordinateTune(!showCoordinateTune)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Sliders size={12} />
            <span>{showCoordinateTune ? 'Hide Coordinates' : 'Fine-Tune Coordinates'}</span>
          </button>
        </div>

        {/* Multi-Level Geographic Hierarchy Breakdown */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '4px',
          fontSize: '0.78rem',
          color: '#cbd5e1',
          marginTop: '2px'
        }}>
          <div><strong>Country:</strong> {activeLocation.country || 'India'}</div>
          <div><strong>State:</strong> {activeLocation.state || 'N/A'}</div>
          <div><strong>District:</strong> {activeLocation.district || 'N/A'}</div>
          <div><strong>Mandal/Taluk:</strong> {activeLocation.mandal || 'N/A'}</div>
          <div><strong>Town/Village:</strong> {activeLocation.city_or_village || 'N/A'}</div>
        </div>

        {/* Technical Coordinates and Timezone for Astrology Engine */}
        <div style={{
          display: 'flex',
          gap: '12px',
          fontSize: '0.75rem',
          color: '#38bdf8',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '4px',
          marginTop: '2px',
          flexWrap: 'wrap'
        }}>
          <span>📍 Lat: <strong>{activeLocation.latitude}°</strong></span>
          <span>📍 Lon: <strong>{activeLocation.longitude}°</strong></span>
          <span>🌐 Timezone: <strong>{activeLocation.timezone} (UTC{activeLocation.timezone_offset >= 0 ? `+${activeLocation.timezone_offset}` : activeLocation.timezone_offset})</strong></span>
        </div>

        {/* PC / Laptop Wi-Fi IP Geolocation Notice */}
        {activeLocation.source === 'gps' && (
          <div style={{
            marginTop: '6px',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            fontSize: '0.78rem',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={15} style={{ color: '#fbbf24', flexShrink: 0 }} />
              <span>
                <strong>PC / Broadband Wi-Fi Note:</strong> Desktop browsers estimate GPS via ISP routing (which commonly points to regional hubs like Hyderabad). If this differs from your actual location, simply use Search Place or the Hierarchy selector above.
              </span>
            </div>
          </div>
        )}

        {/* Coordinate Fine Tuning Drawer */}
        {showCoordinateTune && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px dashed rgba(255,255,255,0.1)'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2px' }}>Latitude (°)</label>
              <input
                type="number"
                step="any"
                value={activeLocation.latitude}
                onChange={(e) => setActiveLocation({ ...activeLocation, latitude: parseFloat(e.target.value) || 0, source: 'manual_tune' })}
                style={{
                  width: '100%',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  background: '#090d16',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2px' }}>Longitude (°)</label>
              <input
                type="number"
                step="any"
                value={activeLocation.longitude}
                onChange={(e) => setActiveLocation({ ...activeLocation, longitude: parseFloat(e.target.value) || 0, source: 'manual_tune' })}
                style={{
                  width: '100%',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  background: '#090d16',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VedicLocationSelector;
