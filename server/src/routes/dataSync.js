import { Router } from "express";
import {
  getCollectionAsync,
  saveCollectionAsync,
  getAllCollectionsAsync,
  saveAllCollectionsAsync,
  getDataVersion,
  isDbConnected
} from "../db.js";

const router = Router();

// 1. Get current data version (for ultra-lightweight change detection / polling)
router.get("/version", (req, res) => {
  res.json({
    success: true,
    version: getDataVersion(),
    isDbConnected: isDbConnected(),
    timestamp: new Date().toISOString()
  });
});

// 2. Get full data bundle across all collections
router.get("/all/bundle", async (req, res) => {
  try {
    const bundle = await getAllCollectionsAsync();
    res.json({
      success: true,
      data: bundle,
      version: getDataVersion(),
      isDbConnected: isDbConnected()
    });
  } catch (err) {
    console.error("GET /api/data/all/bundle error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Save / sync full bundle
router.post("/all/sync", async (req, res) => {
  try {
    const bundle = req.body || {};
    const result = await saveAllCollectionsAsync(bundle);
    res.json({
      success: true,
      message: "All collections synchronized successfully",
      version: result.version
    });
  } catch (err) {
    console.error("POST /api/data/all/sync error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Get specific collection (e.g., doctors, tests, patients, reports, bills, users, settings)
router.get("/:collection", async (req, res) => {
  try {
    const { collection } = req.params;
    const data = await getCollectionAsync(collection, []);
    res.json({
      success: true,
      collection,
      data,
      version: getDataVersion()
    });
  } catch (err) {
    console.error(`GET /api/data/${req.params.collection} error:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Update specific collection
router.post("/:collection", async (req, res) => {
  try {
    const { collection } = req.params;
    const data = req.body;
    const result = await saveCollectionAsync(collection, data);
    res.json({
      success: true,
      collection,
      message: `${collection} saved successfully`,
      version: result.version
    });
  } catch (err) {
    console.error(`POST /api/data/${req.params.collection} error:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Upsert single item in a collection
router.post("/:collection/item", async (req, res) => {
  try {
    const { collection } = req.params;
    const newItem = req.body;
    if (!newItem || typeof newItem !== "object") {
      return res.status(400).json({ success: false, error: "Invalid item payload" });
    }

    const currentItems = await getCollectionAsync(collection, []);
    let updatedItems;

    if (Array.isArray(currentItems)) {
      const id = newItem.id || newItem.code;
      const index = currentItems.findIndex((x) => x.id === id || (x.code && x.code === id));
      if (index >= 0) {
        updatedItems = [...currentItems];
        updatedItems[index] = { ...updatedItems[index], ...newItem, updatedAt: new Date().toISOString() };
      } else {
        updatedItems = [{ ...newItem, createdAt: new Date().toISOString() }, ...currentItems];
      }
    } else {
      updatedItems = newItem;
    }

    const result = await saveCollectionAsync(collection, updatedItems);
    res.json({
      success: true,
      collection,
      data: updatedItems,
      version: result.version
    });
  } catch (err) {
    console.error(`POST /api/data/${req.params.collection}/item error:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Delete single item from collection
router.delete("/:collection/:id", async (req, res) => {
  try {
    const { collection, id } = req.params;
    const currentItems = await getCollectionAsync(collection, []);

    if (Array.isArray(currentItems)) {
      const updatedItems = currentItems.filter((x) => String(x.id) !== String(id) && String(x.code) !== String(id));
      const result = await saveCollectionAsync(collection, updatedItems);
      return res.json({
        success: true,
        collection,
        message: `Item ${id} deleted from ${collection}`,
        version: result.version
      });
    }

    res.status(400).json({ success: false, error: "Collection is not an array" });
  } catch (err) {
    console.error(`DELETE /api/data/${req.params.collection}/${req.params.id} error:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
