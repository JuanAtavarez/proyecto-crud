const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const PORT = 3000;

// Configuración de paths
const dataPath = path.join(__dirname, 'data', 'db.json');
const publicPath = path.join(__dirname, 'public');

// Middlewares
app.use(express.json());
app.use(express.static(publicPath));

// Helper: Leer datos del JSON
async function readData() {
  try {
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Helper: Guardar datos en JSON
async function writeData(data) {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
}

// ========== RUTAS DEL CRUD ========== //

// Crear usuario
app.post('/users', async (req, res) => {
  try {
    const users = await readData();
    const newUser = {
      id: Date.now(),
      name: req.body.name,
      email: req.body.email,
      age: req.body.age || null
    };
    
    users.push(newUser);
    await writeData(users);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Leer todos los usuarios
app.get('/users', async (req, res) => {
  try {
    const users = await readData();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al leer usuarios' });
  }
});

// Obtener un usuario por ID 
app.get('/users/:id', async (req, res) => {
    try {
      const users = await readData();
      const id = parseInt(req.params.id);
      const user = users.find(user => user.id === id);
  
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener usuario' });
    }
  });


// Actualizar usuario
app.put('/users/:id', async (req, res) => {
  try {
    const users = await readData();
    const id = parseInt(req.params.id);
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    users[userIndex] = {
      ...users[userIndex],
      ...req.body,
      id: id // Mantener el mismo ID
    };

    await writeData(users);
    res.json(users[userIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Eliminar usuario
app.delete('/users/:id', async (req, res) => {
  try {
    const users = await readData();
    const id = parseInt(req.params.id);
    const filteredUsers = users.filter(user => user.id !== id);

    if (users.length === filteredUsers.length) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await writeData(filteredUsers);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// Servir frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🟢 Servidor activo en http://localhost:${PORT}`);
  console.log(`📁 Datos almacenados en: ${dataPath}`);
});