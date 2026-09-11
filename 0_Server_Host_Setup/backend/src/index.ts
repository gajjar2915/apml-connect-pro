import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import apiRoutes from './routes/api';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

const PORT = process.env.PORT || 5005;

// Local Disk Persistence File Path
const DB_FILE_PATH = path.join(process.cwd(), 'dev_db.json');

const defaultMeshState: any = {
  clinicStatus: 'Online',
  queue: [
    {
      token: 'A-101',
      name: 'Rahul Kumar',
      age: '34',
      gender: 'Male',
      doctor: 'Dr. Sarah Jenkins',
      status: 'WAITING',
      waitTime: 10,
      priority: 'URGENT',
      time: '10:15 AM',
      type: 'Walk-In Consultation'
    },
    {
      token: 'A-102',
      name: 'Priya Sharma',
      age: '28',
      gender: 'Female',
      doctor: 'Dr. Sarah Jenkins',
      status: 'WAITING',
      waitTime: 20,
      priority: 'NORMAL',
      time: '10:30 AM',
      type: 'Follow-Up'
    },
    {
      token: 'A-103',
      name: 'Amit Patel',
      age: '45',
      gender: 'Male',
      doctor: 'Dr. Sarah Jenkins',
      status: 'WAITING',
      waitTime: 30,
      priority: 'NORMAL',
      time: '10:45 AM',
      type: 'New Consultation'
    }
  ],
  documents: [],
  invoices: [],
  notifications: [
    {
      id: Date.now(),
      icon: '🟢',
      title: 'Clinic Status Changed',
      desc: 'Clinic operations set to Online.',
      time: 'Just now',
      read: false,
      category: 'system'
    }
  ],
  broadcastDelay: null,
  appointments: [],
  claims: [],
  labBookings: [],
  patients: [
    { id: 'P101', mrn: 'MRN-8801', name: 'Rahul Kumar', age: 34, gender: 'Male', phone: '+91 9876543210', blood: 'O+', status: 'Active', lastVisit: '2026-07-20', insurance: true },
    { id: 'P102', mrn: 'MRN-8802', name: 'Priya Sharma', age: 28, gender: 'Female', phone: '+91 9876543211', blood: 'B+', status: 'Active', lastVisit: '2026-07-15', insurance: false },
    { id: 'P103', mrn: 'MRN-8803', name: 'Amit Patel', age: 45, gender: 'Male', phone: '+91 9876543212', blood: 'A+', status: 'Active', lastVisit: '2026-07-22', insurance: true }
  ],
  settings: {
    notificationsEnabled: true,
    smsTemplatesEnabled: true,
    clinicAddress: '12, Green Park Avenue, Metro Hub',
    clinicPhone: '+91 9988221100'
  },
  stocks: [
    { id: 'STK001', name: 'Tab. Paracetamol 650mg', qty: 450, min: 100, batch: 'BAT-2026A', expiryDays: 90, outOfStock: false },
    { id: 'STK002', name: 'Tab. Telmisartan 40mg', qty: 85, min: 100, batch: 'BAT-2026B', expiryDays: 30, outOfStock: false },
    { id: 'STK003', name: 'Tab. Amlodipine 5mg', qty: 210, min: 50, batch: 'BAT-2026C', expiryDays: 60, outOfStock: false },
    { id: 'STK004', name: 'Syp. Ascoril DX 100ml', qty: 15, min: 20, batch: 'BAT-2026D', expiryDays: 30, outOfStock: false },
    { id: 'STK005', name: 'Tab. Vitamin C 500mg', qty: 620, min: 100, batch: 'BAT-2026E', expiryDays: 90, outOfStock: false },
    { id: 'STK006', name: 'Tab. Amoxicillin 500mg', qty: 140, min: 50, batch: 'BAT-2026F', expiryDays: 60, outOfStock: false }
  ],
  billingCatalog: [
    { id: 'BC001', name: 'First Consultation', price: 500, category: 'Consultation Fees' },
    { id: 'BC002', name: 'Follow-Up Consultation', price: 300, category: 'Consultation Fees' },
    { id: 'BC003', name: 'Emergency Consultation', price: 800, category: 'Consultation Fees' },
    { id: 'BC004', name: 'Wound Dressing', price: 250, category: 'Clinic Procedures' },
    { id: 'BC005', name: 'ECG (Electrocardiogram)', price: 350, category: 'In-House Diagnostics' },
    { id: 'BC006', name: 'Blood Test (CBC)', price: 400, category: 'In-House Diagnostics' },
    { id: 'BC007', name: 'X-Ray Chest', price: 600, category: 'In-House Diagnostics' }
  ],
  accounts: [
    { role: 'receptionist', email: 'receptionist@clinic.com', name: 'Reception Front Desk', password: '123' },
    { role: 'doctor', email: 'doctor@clinic.com', name: 'Dr. Sarah Jenkins', password: '123' },
    { role: 'pharmacy', email: 'pharmacy@clinic.com', name: 'Pharmacy Counter', password: '123' }
  ]
};

// Load database state from disk if exists
let globalMeshState: any = defaultMeshState;
try {
  if (fs.existsSync(DB_FILE_PATH)) {
    const rawData = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(rawData);
    if (parsed && typeof parsed === 'object') {
      globalMeshState = { ...defaultMeshState, ...parsed };
      console.log('Successfully loaded persisted database from dev_db.json');
    }
  } else {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(defaultMeshState, null, 2), 'utf-8');
  }
} catch (err) {
  console.error('Failed to load dev_db.json, using defaults:', err);
}

// Persist state to disk helper
const saveDatabaseToDisk = (state: any) => {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database persistence to disk:', err);
  }
};

app.use(cors());
app.use(express.json());

// Real-time Central Mesh Sync Endpoints
app.get('/api/mesh-sync', (req, res) => {
  res.status(200).json(globalMeshState);
});

app.post('/api/mesh-sync', (req, res) => {
  if (req.body && typeof req.body === 'object') {
    globalMeshState = { ...globalMeshState, ...req.body };
    saveDatabaseToDisk(globalMeshState);
    io.emit('mesh-sync-update', globalMeshState);
  }
  res.status(200).json({ success: true, updated: new Date() });
});

// API route binding
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Socket.IO signaling & real-time mesh server
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  // Push latest central state immediately on client connect
  socket.emit('mesh-sync-update', globalMeshState);

  socket.on('mesh-sync-update', (data) => {
    if (data && typeof data === 'object') {
      globalMeshState = { ...globalMeshState, ...data };
      saveDatabaseToDisk(globalMeshState);
      io.emit('mesh-sync-update', globalMeshState);
    }
  });

  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    console.log(`Client ${socket.id} joined room: ${roomId}`);
    socket.to(roomId).emit('peer-connected', { peerId: socket.id });
  });

  socket.on('sdp-offer', ({ roomId, sdp }) => {
    socket.to(roomId).emit('sdp-offer', { peerId: socket.id, sdp });
  });

  socket.on('sdp-answer', ({ roomId, sdp }) => {
    socket.to(roomId).emit('sdp-answer', { peerId: socket.id, sdp });
  });

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('ice-candidate', { peerId: socket.id, candidate });
  });

  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`APML Connect Pro central server listening on port ${PORT}`);
});
