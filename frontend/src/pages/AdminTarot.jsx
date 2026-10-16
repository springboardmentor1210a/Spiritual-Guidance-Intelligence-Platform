import {
  BookOpen,
  Layers,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";


export default function AdminTarot() {

  const [cardCount, setCardCount] = useState(0);
  const [spreads, setSpreads] = useState({});
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    loadTarotData();

  }, []);


  async function loadTarotData() {

    try {

      const [cards, spreadData] = await Promise.all([
        apiRequest("/api/v1/tarot/cards/count"),
        apiRequest("/api/v1/tarot/spreads"),
      ]);

      setCardCount(cards.card_count || 0);
      setSpreads(spreadData.spreads || {});

    } finally {

      setLoading(false);

    }

  }


  return (
    <div className="page-container">

      <section className="dashboard-hero role-dashboard-hero">

        <div>

          <div className="eyebrow">
            <BookOpen size={15} />
            ADMINISTRATION
          </div>

          <h1>
            Tarot management
            <span className="muted-dot">.</span>
          </h1>

          <p>
            Inspect the Tarot dataset and supported reading spreads.
          </p>

        </div>

        <div className="role-pill">
          <ShieldCheck size={15} />
          Administrator
        </div>

      </section>


      <section className="role-stat-grid">

        <div className="role-stat-card">

          <div className="role-stat-top">
            <div className="role-stat-icon">
              <BookOpen size={19} />
            </div>

            <span>Tarot cards</span>
          </div>

          <strong>
            {loading ? 0 : cardCount}
          </strong>

          <p>
            Cards loaded in dataset
          </p>

        </div>


        <div className="role-stat-card">

          <div className="role-stat-top">
            <div className="role-stat-icon">
              <Layers size={19} />
            </div>

            <span>Supported spreads</span>
          </div>

          <strong>
            {loading ? 0 : Object.keys(spreads).length}
          </strong>

          <p>
            Available Tarot spread types
          </p>

        </div>


        <div className="role-stat-card">

          <div className="role-stat-top">
            <div className="role-stat-icon">
              <Sparkles size={19} />
            </div>

            <span>Engine status</span>
          </div>

          <strong>
            Active
          </strong>

          <p>
            Tarot engine available
          </p>

        </div>

      </section>


      <section className="panel">

        <div className="panel-heading">

          <div>
            <span className="section-kicker">
              TAROT ENGINE
            </span>

            <h2>
              Supported spreads
            </h2>
          </div>

        </div>


        <div className="dashboard-action-list">

          {Object.entries(spreads).map(
            ([name, spread]) => (

              <div
                className="dashboard-action"
                key={name}
              >

                <div className="dashboard-action-icon">
                  <BookOpen size={20} />
                </div>

                <div>

                  <strong>
                    {name
                      .replaceAll("_", " ")
                      .replace(
                        /\b\w/g,
                        (char) => char.toUpperCase()
                      )}
                  </strong>

                  <span>
                    {spread.card_count} cards •{" "}
                    {spread.positions.join(", ")}
                  </span>

                </div>

              </div>

            )
          )}

        </div>

      </section>

    </div>
  );
}