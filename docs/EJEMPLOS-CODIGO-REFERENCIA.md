# 💻 Ejemplos de Código de Referencia para Nuevos Términos

**Propósito:** Ejemplos listos para copiar y adaptar al crear nuevos términos

---

## 📝 Estructura HTML Completa (Para términos HTML)

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Descripción de la página">
    <title>Título de la Página</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 40px;
            max-width: 600px;
            width: 100%;
        }

        h1 {
            color: #333;
            margin-bottom: 20px;
            font-size: 28px;
        }

        p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 15px;
        }

        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
        }

        button:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .code-block {
            background: #f5f5f5;
            border-left: 4px solid #667eea;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 Bienvenido a mi Ejemplo</h1>
        <p>Este es un ejemplo completo y funcional de HTML con CSS integrado.</p>
        
        <button onclick="mostrarMensaje()">Haz clic aquí</button>
        
        <div class="code-block">
            &lt;div class="container"&gt;...&lt;/div&gt;
        </div>
    </div>

    <script>
        function mostrarMensaje() {
            alert('¡El script se ejecutó correctamente!');
        }

        // Ejecutar algo cuando carga la página
        window.addEventListener('DOMContentLoaded', function() {
            console.log('Página cargada completamente');
        });
    </script>
</body>
</html>
```

---

## 🎨 Estructura CSS Completa (Para términos CSS/Tailwind)

```css
/* Variables CSS */
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --success-color: #10b981;
    --danger-color: #ef4444;
    --warning-color: #f59e0b;
    --text-dark: #1f2937;
    --text-light: #6b7280;
    --bg-light: #f9fafb;
    --spacing-unit: 1rem;
    --border-radius: 0.5rem;
    --transition: all 0.3s ease;
}

/* Reset y estilos base */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    font-size: 16px;
    scroll-behavior: smooth;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: var(--text-dark);
    background-color: var(--bg-light);
}

/* Contenedores */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-unit);
}

.grid {
    display: grid;
    gap: var(--spacing-unit);
}

.grid-cols-2 {
    grid-template-columns: repeat(2, 1fr);
}

.grid-cols-3 {
    grid-template-columns: repeat(3, 1fr);
}

/* Flexbox */
.flex {
    display: flex;
}

.flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

.flex-between {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.flex-col {
    flex-direction: column;
}

/* Componentes */
.button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background-color: var(--primary-color);
    color: white;
    text-decoration: none;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: var(--transition);
    font-weight: 500;
}

.button:hover {
    background-color: var(--secondary-color);
    transform: translateY(-2px);
}

.button.secondary {
    background-color: transparent;
    border: 2px solid var(--primary-color);
    color: var(--primary-color);
}

.button.secondary:hover {
    background-color: var(--primary-color);
    color: white;
}

/* Cards */
.card {
    background: white;
    border-radius: var(--border-radius);
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: var(--transition);
}

.card:hover {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    transform: translateY(-5px);
}

/* Responsive */
@media (max-width: 768px) {
    .grid-cols-2,
    .grid-cols-3 {
        grid-template-columns: 1fr;
    }

    html {
        font-size: 14px;
    }
}
```

---

## ⚡ Estructura JavaScript Completa (Para términos JS/TS)

```javascript
// Ejemplo funcional de JavaScript moderno

/**
 * Clase para manejar una lista de tareas
 */
class TodoList {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.todos = this.loadTodos();
        this.init();
    }

    /**
     * Inicializar la aplicación
     */
    init() {
        this.render();
        this.attachEventListeners();
    }

    /**
     * Cargar todos desde localStorage
     */
    loadTodos() {
        const stored = localStorage.getItem('todos');
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Guardar todos en localStorage
     */
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    /**
     * Agregar nuevo todo
     */
    addTodo(text) {
        if (!text.trim()) return;

        const todo = {
            id: Date.now(),
            text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.push(todo);
        this.saveTodos();
        this.render();
    }

    /**
     * Eliminar todo por id
     */
    removeTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
    }

    /**
     * Marcar como completado
     */
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    /**
     * Renderizar la lista
     */
    render() {
        const html = `
            <div class="todo-container">
                <h2>Mi Lista de Tareas</h2>
                <div class="input-group">
                    <input 
                        type="text" 
                        id="todoInput" 
                        placeholder="Agregar nueva tarea..."
                    />
                    <button id="addBtn">Agregar</button>
                </div>
                <ul class="todo-list">
                    ${this.todos.map(todo => `
                        <li class="todo-item ${todo.completed ? 'completed' : ''}">
                            <input 
                                type="checkbox" 
                                ${todo.completed ? 'checked' : ''} 
                                onchange="app.toggleTodo(${todo.id})"
                            />
                            <span>${todo.text}</span>
                            <button class="delete-btn" onclick="app.removeTodo(${todo.id})">
                                ✕
                            </button>
                        </li>
                    `).join('')}
                </ul>
                <p class="stats">
                    Total: ${this.todos.length} | 
                    Completados: ${this.todos.filter(t => t.completed).length}
                </p>
            </div>
        `;

        this.container.innerHTML = html;
    }

    /**
     * Adjuntar event listeners
     */
    attachEventListeners() {
        const input = this.container.querySelector('#todoInput');
        const btn = this.container.querySelector('#addBtn');

        btn.addEventListener('click', () => this.addTodo(input.value));
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo(input.value);
        });

        input.focus();
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoList('app');
});

// Estilos necesarios
const style = document.createElement('style');
style.textContent = `
    .todo-container {
        max-width: 500px;
        margin: 20px auto;
        padding: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .input-group {
        display: flex;
        gap: 10px;
        margin: 20px 0;
    }
    
    .input-group input {
        flex: 1;
        padding: 10px;
        border: 2px solid #ddd;
        border-radius: 4px;
    }
    
    .input-group button {
        padding: 10px 20px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    
    .todo-list {
        list-style: none;
        padding: 0;
    }
    
    .todo-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        border-bottom: 1px solid #eee;
    }
    
    .todo-item.completed span {
        text-decoration: line-through;
        opacity: 0.5;
    }
    
    .delete-btn {
        margin-left: auto;
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
`;
document.head.appendChild(style);
```

---

## 📋 Template TypeScript (Para términos TypeScript)

```typescript
/**
 * Interfaz para definir la estructura
 */
interface Usuario {
    id: number;
    nombre: string;
    email: string;
    activo: boolean;
}

/**
 * Clase genérica para manejar recursos
 */
class RepositorioGenerico<T> {
    private items: T[] = [];

    /**
     * Agregar item
     */
    agregar(item: T): void {
        this.items.push(item);
    }

    /**
     * Obtener todos los items
     */
    obtenerTodos(): T[] {
        return [...this.items];
    }

    /**
     * Filtrar items
     */
    filtrar(predicado: (item: T) => boolean): T[] {
        return this.items.filter(predicado);
    }

    /**
     * Contar items
     */
    contar(): number {
        return this.items.length;
    }
}

// Uso
const usuariosRepo = new RepositorioGenerico<Usuario>();

usuariosRepo.agregar({
    id: 1,
    nombre: "Juan",
    email: "juan@example.com",
    activo: true
});

usuariosRepo.agregar({
    id: 2,
    nombre: "María",
    email: "maria@example.com",
    activo: false
});

// Obtener usuarios activos
const usuariosActivos = usuariosRepo.filtrar(u => u.activo);
console.log(`Usuarios activos: ${usuariosActivos.length}`);
```

---

## 🧪 Template para React (JSX)

```jsx
import React, { useState, useEffect } from 'react';

/**
 * Componente contador interactivo
 */
export function ContadorDemo() {
    const [contador, setContador] = useState(0);
    const [historial, setHistorial] = useState<number[]>([]);

    /**
     * Efecto para guardar historial
     */
    useEffect(() => {
        setHistorial(prev => [...prev, contador]);
    }, [contador]);

    const incrementar = () => setContador(prev => prev + 1);
    const decrementar = () => setContador(prev => prev - 1);
    const reiniciar = () => {
        setContador(0);
        setHistorial([]);
    };

    return (
        <div style={{
            maxWidth: '400px',
            margin: '20px auto',
            padding: '20px',
            border: '2px solid #667eea',
            borderRadius: '8px',
            textAlign: 'center'
        }}>
            <h2>Contador: {contador}</h2>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                <button onClick={decrementar} style={{ padding: '10px 20px' }}>
                    Disminuir
                </button>
                <button onClick={reiniciar} style={{ padding: '10px 20px' }}>
                    Reiniciar
                </button>
                <button onClick={incrementar} style={{ padding: '10px 20px' }}>
                    Incrementar
                </button>
            </div>

            <div style={{ textAlign: 'left', background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                <p><strong>Historial:</strong></p>
                <p>{historial.join(' → ')}</p>
            </div>
        </div>
    );
}

export default ContadorDemo;
```

---

## 📊 Template SQL (Para términos de Base de Datos)

```sql
-- Ejemplo: Crear tabla de usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true
);

-- Crear tabla de posts
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    vistas INTEGER DEFAULT 0
);

-- Insertar datos
INSERT INTO usuarios (nombre, email) VALUES 
('Juan Pérez', 'juan@example.com'),
('María García', 'maria@example.com');

-- Consultas útiles
SELECT * FROM usuarios WHERE activo = true;
SELECT usuarios.nombre, COUNT(posts.id) as total_posts 
FROM usuarios 
LEFT JOIN posts ON usuarios.id = posts.usuario_id 
GROUP BY usuarios.id;

-- Actualizar
UPDATE usuarios SET activo = false WHERE id = 1;

-- Eliminar
DELETE FROM posts WHERE id = 1;
```

---

## ✅ Checklist Antes de Guardar Código

Antes de guardar cualquier snippet, verificar:

```
CÓDIGO
☐ Se ejecuta sin errores en consola
☐ Tiene 200+ caracteres
☐ Es autoexplicativo
☐ Incluye comentarios en partes complejas
☐ No depende de librerías externas (excepto si es necesario)
☐ Funciona en el LivePreview

ESTRUCTURA
☐ Tiene estructura completa (no fragmentos)
☐ Está indentado correctamente
☐ Usa convenciones de nombres claras
☐ Está formateado consistentemente

DOCUMENTACIÓN
☐ El código tiene ejemplos de uso
☐ Los comentarios explican el "por qué"
☐ Las funciones tienen docstrings/JSDoc
☐ Hay ejemplos prácticos
```

---

**Versión:** 1.0  
**Última actualización:** 29 de noviembre de 2025  
**Estado:** Completo ✅
