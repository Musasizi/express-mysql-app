const User = require('../models/userModel');




const getAllUsers = async (req, res) => {
  try {
    const [results] = await User.getAll();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

















const updateUser = async (req, res) => {
  const { username, email } = req.body;
  const userId = req.params.id;
  try {
    await User.update(userId, username, email);
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


updateUser(sfsfsfsf)

const deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    await User.delete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllUsers, updateUser, deleteUser };