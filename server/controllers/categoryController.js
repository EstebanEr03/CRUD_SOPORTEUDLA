// server/controllers/categoryController.js
import Category from '../models/categoryModel.js';
import Subcategory from '../models/subcategoryModel.js';

// Crear Categoría
export const createCategory = async (req, res) => {
  const { nombre } = req.body;
  try {
    const newCategory = await Category.create({ nombre });
    res.status(201).json({ message: 'Categoría creada exitosamente', category: newCategory });
  } catch (error) {
    console.error("Error al crear la categoría:", error);
    res.status(500).json({ error: 'Error al crear la categoría' });
  }
};

// Obtener Categorías y Subcategorías
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll(); // Obtén todas las categorías
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
};

// Obtener todas las subcategorías asociadas a una categoría específica
// Obtener todas las subcategorías asociadas a una categoría específica
export const getSubcategories = async (req, res) => {
  const { categoria_id } = req.query;

  try {
    if (!categoria_id) {
      return res.status(400).json({ error: 'El parámetro categoria_id es obligatorio' });
    }

    // Buscar subcategorías que coincidan con categoria_id
    const subcategories = await Subcategory.findAll({
      where: { categoria_id }, // Filtra las subcategorías por categoría
    });

    res.status(200).json(subcategories); // Devuelve las subcategorías filtradas
  } catch (error) {
    console.error('Error al obtener subcategorías:', error);
    res.status(500).json({ error: 'Error al obtener subcategorías' });
  }
};




  // Actualizar una subcategoría existente
export const updateSubcategory = async (req, res) => {
    const { id } = req.params;
    const { nombre, tiempo_estimado } = req.body;
  
    try {
      const subcategory = await Subcategory.findByPk(id);
      if (!subcategory) return res.status(404).json({ error: 'Subcategoría no encontrada' });
  
      subcategory.nombre = nombre;
      subcategory.tiempo_estimado = tiempo_estimado;
      await subcategory.save();
  
      res.status(200).json({ message: 'Subcategoría actualizada exitosamente', subcategory });
    } catch (error) {
      console.error("Error al actualizar la subcategoría:", error);
      res.status(500).json({ error: 'Error al actualizar la subcategoría' });
    }
  };
  
