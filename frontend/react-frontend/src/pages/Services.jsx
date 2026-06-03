import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.get('/services').then((response) => setServices(response.data));
  }, []);

  return (
    <div className="admin-dashboard">
      <h1>eCitizen Health Services</h1>
      <div className="cards">
        {services.map((service) => (
          <div key={service.id} className="card">
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
