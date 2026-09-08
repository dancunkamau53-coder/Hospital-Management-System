import React, { useEffect, useState } from 'react';
import { getNotifications } from '../../services/featureService';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  useEffect(() => { getNotifications().then((response) => setNotifications(response.data || [])).catch(() => {}); }, []);
  return <div><div className="admin-dashboard"><h1>Notifications</h1><p>Appointment reminders, payment updates, prescription refills, and health alerts.</p></div><section className="cards">{notifications.length ? notifications.map((notification) => <article className="card" key={notification.id}><h3>{notification.title}</h3><p>{notification.message}</p><small>{notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}</small></article>) : <div className="table-card"><p>No notifications yet.</p></div>}</section></div>;
}
