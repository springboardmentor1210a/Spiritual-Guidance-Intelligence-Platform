const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Initialize SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'reader', 'consultant', 'admin'),
    defaultValue: 'user'
  }
});

// Reading History Model
const Reading = sequelize.define('Reading', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('palm', 'tarot'),
    allowNull: false
  },
  data: {
    type: DataTypes.JSON,
    allowNull: false
  },
  guidanceScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

// Session Model
const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'scheduled'),
    defaultValue: 'scheduled'
  },
  scheduledFor: {
    type: DataTypes.DATE,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER, // in seconds
    allowNull: true
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  meetLink: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// Report Model
const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Completed', 'Delivered'),
    defaultValue: 'Pending'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

User.hasMany(Reading);
Reading.belongsTo(User);

User.hasMany(Session, { as: 'ClientSessions', foreignKey: 'ClientId' });
Session.belongsTo(User, { as: 'Client', foreignKey: 'ClientId' });

User.hasMany(Session, { as: 'ReaderSessions', foreignKey: 'ReaderId' });
Session.belongsTo(User, { as: 'Reader', foreignKey: 'ReaderId' });

Reading.hasOne(Report);
Report.belongsTo(Reading);

Session.hasOne(Reading);
Reading.belongsTo(Session);

// GuidanceRequest Model
const GuidanceRequest = sequelize.define('GuidanceRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Awaiting Expert Response', 'Expert Responded'),
    defaultValue: 'Awaiting Expert Response'
  },
  expertType: {
    type: DataTypes.STRING,
    defaultValue: 'Tarot Reader'
  },
  expertResponse: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  respondedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

User.hasMany(GuidanceRequest, { as: 'UserRequests', foreignKey: 'UserId' });
GuidanceRequest.belongsTo(User, { as: 'Client', foreignKey: 'UserId' });

User.hasMany(GuidanceRequest, { as: 'ExpertResponses', foreignKey: 'ExpertId' });
GuidanceRequest.belongsTo(User, { as: 'Expert', foreignKey: 'ExpertId' });
// Notification Model
const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('alert', 'reminder', 'announcement', 'success'),
    defaultValue: 'alert'
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

User.hasMany(Notification, { foreignKey: 'UserId' });
Notification.belongsTo(User, { foreignKey: 'UserId' });

// Sync database
async function syncDatabase() {
  try {
    await sequelize.sync();
    console.log("Database synchronized");
  } catch (err) {
    console.error("Database sync failed:", err);
    // Don't exit the process, just log the error. The app can continue
    // with in-memory operations, but database functionality will be limited
  }
}
syncDatabase();

module.exports = { sequelize, User, Reading, Session, Report, GuidanceRequest, Notification };
