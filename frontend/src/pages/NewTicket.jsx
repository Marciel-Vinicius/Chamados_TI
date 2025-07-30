import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function NewTicket() {
    const [data, setData] = useState({
        title: '',
        description: '',
        category: '',
        priority: 'Média'
    });
    const [file, setFile] = useState(null);
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    const onChange = e => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const onFileChange = e => {
        setFile(e.target.files[0]);
    };

    const onSubmit = async e => {
        e.preventDefault();
        setMsg('');
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) =>
                formData.append(key, value)
            );
            if (file) formData.append('attachment', file);

            const token = localStorage.getItem('token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            await axios.post('/tickets', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate('/tickets');
        } catch {
            setMsg('Erro ao criar chamado.');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Abrir Chamado</h2>
            {msg && <div className="mb-4 text-red-500">{msg}</div>}
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Título</label>
                    <input
                        name="title"
                        value={data.title}
                        onChange={onChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Categoria</label>
                    <input
                        name="category"
                        value={data.category}
                        onChange={onChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Descrição</label>
                    <textarea
                        name="description"
                        value={data.description}
                        onChange={onChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Prioridade</label>
                    <select
                        name="priority"
                        value={data.priority}
                        onChange={onChange}
                        className="w-full border px-3 py-2 rounded"
                    >
                        <option>Baixa</option>
                        <option>Média</option>
                        <option>Alta</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Anexo (opcional)</label>
                    <input type="file" onChange={onFileChange} />
                </div>
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    Enviar
                </button>
            </form>
        </div>
    );
}
