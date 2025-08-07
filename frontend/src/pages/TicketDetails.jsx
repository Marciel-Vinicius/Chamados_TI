// frontend/src/pages/TicketDetails.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function TicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    axios.get(`/tickets/${id}`).then(res => setTicket(res.data));
  }, [id]);

  if (!ticket) return <p>Carregando…</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">{ticket.title}</h2>
      <p className="text-secondary mb-2">
        Categoria: {ticket.category.name} · Prioridade: {ticket.priority.name}
      </p>
      <p className="mb-6">{ticket.description}</p>
      {ticket.attachments.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium mb-2">Anexos</h3>
          <ul className="list-disc list-inside">
            {ticket.attachments.map(a => (
              <li key={a.id}>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {a.filename}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <h3 className="text-xl font-semibold mb-3">Comentários</h3>
        {ticket.comments.map(c => (
          <div key={c.id} className="mb-4 border-b pb-2">
            <p className="text-sm text-secondary">{c.user.name}</p>
            <p>{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}