// backend/src/scripts/seed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
    sequelize,
    User,
    Sector,
    Category,
    Priority
} = require('../models');

(async () => {
    try {
        console.log('🔄 Sincronizando modelos...');
        await sequelize.sync({ alter: true });

        console.log('🌱 Criando dados básicos...');

        // Setores
        const [tiSector] = await Sector.findOrCreate({
            where: { name: 'TI' },
            defaults: { name: 'TI' }
        });

        // Categorias
        const categories = ['Rede', 'Impressora', 'Sistema', 'Hardware', 'Outro'];
        for (const name of categories) {
            await Category.findOrCreate({ where: { name }, defaults: { name } });
        }

        // Prioridades
        const priorities = ['Baixa', 'Média', 'Alta'];
        for (const name of priorities) {
            await Priority.findOrCreate({ where: { name }, defaults: { name } });
        }

        // Usuário TI (admin)
        const adminEmail = 'admin@empresa.com';
        const adminPassword = 'Adm!n123'; // troque depois
        const passwordHash = await bcrypt.hash(adminPassword, 10);

        const [admin, created] = await User.findOrCreate({
            where: { email: adminEmail },
            defaults: {
                email: adminEmail,
                password: passwordHash,
                role: 'TI',
                setor: 'TI',
                sectorId: tiSector.id
            }
        });

        console.log(created
            ? `👤 Usuário TI criado: ${adminEmail} / ${adminPassword}`
            : `ℹ️ Usuário TI já existia: ${adminEmail}`);

        console.log('✅ Seed finalizado com sucesso.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Erro no seed:', err);
        process.exit(1);
    }
})();
