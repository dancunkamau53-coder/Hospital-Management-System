import React from 'react';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main">
        <AppRoutes />
      </main>
    </div>
  );
}
