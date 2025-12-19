// backend/src/controllers/user.controller.js
const bcrypt = require("bcrypt");
const { User, ActionLog } = require("../models");

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { email, password, role = "admin" } = req.body;
        
        // Проверяем, существует ли пользователь
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await User.create({
            email,
            password: hashedPassword,
            role
        });

        // Логируем создание пользователя
        await ActionLog.create({
            userId: req.user.id,
            action: `Создание пользователя: ${email}`,
            details: `Роль: ${role}`
        });
        
        res.status(201).json({
            id: user.id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        // Нельзя удалить себя
        if (user.id === req.user.id) {
            return res.status(400).json({ error: "Cannot delete yourself" });
        }

        // Логируем удаление
        await ActionLog.create({
            userId: req.user.id,
            action: `Удаление пользователя: ${user.email}`
        });
        
        await user.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        const { email, role } = req.body;
        const updates = {};
        
        if (email) updates.email = email;
        if (role) updates.role = role;
        
        await user.update(updates);

        // Логируем обновление
        await ActionLog.create({
            userId: req.user.id,
            action: `Обновление пользователя: ${user.email}`
        });
        
        res.json({
            id: user.id,
            email: user.email,
            role: user.role,
            updatedAt: user.updatedAt
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Дополнительно: получить текущего пользователя
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};