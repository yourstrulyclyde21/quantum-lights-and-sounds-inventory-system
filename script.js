document.addEventListener("DOMContentLoaded", () => {
  const addForm = document.getElementById("addForm");
  const itemTableBody = document.getElementById("itemTableBody");
  const searchBar = document.getElementById("searchBar");
  const taskNotes = document.getElementById("taskNotes");
  const saveBtn = document.getElementById("saveNotes");
  const clearBtn = document.getElementById("clearNotes");

  let allItems = [];
  let editingId = null;

  // Fetch items from backend
  async function fetchItems() {
    const res = await fetch("/items");
    allItems = await res.json();
    renderItems(allItems);
  }

  // Render items into the table
  function renderItems(items) {
    itemTableBody.innerHTML = "";
    items.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.category}</td>
        <td>${item.brand}</td>
        <td>${item.name}</td>
        <td>${item.serial}</td>
        <td>${item.stock}</td>
        <td>${item.status}</td>
        <td>
          <button data-id="${item._id}" class="editBtn">Edit</button>
          <button data-id="${item._id}" class="deleteBtn">Delete</button>
        </td>
      `;
      itemTableBody.appendChild(row);
    });
    attachActionListeners();
  }

  // Handle Edit/Delete button actions
  function attachActionListeners() {
    document.querySelectorAll(".editBtn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const res = await fetch(`/items/${id}`);
        const item = await res.json();

        document.getElementById("category").value = item.category;
        document.getElementById("brand").value = item.brand;
        document.getElementById("name").value = item.name;
        document.getElementById("serial").value = item.serial;
        document.getElementById("stock").value = item.stock;
        document.getElementById("status").value = item.status;

        editingId = id;
      });
    });

    document.querySelectorAll(".deleteBtn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        await fetch(`/items/${id}`, { method: "DELETE" });
        fetchItems();
      });
    });
  }

  // Handle Add/Update item
  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const brand = document.getElementById("brand").value.trim();
    const name = document.getElementById("name").value.trim();
    const serial = document.getElementById("serial").value.trim();
    const stock = parseInt(document.getElementById("stock").value);

    const stringPattern = /^[A-Za-z\s]{1,26}$/;
    const serialPattern = /^[A-Za-z0-9\-]{1,30}$/;

    if (!stringPattern.test(brand) || !stringPattern.test(name)) {
      alert("Brand and Name must contain only letters (max 26 characters).");
      return;
    }

    if (!serialPattern.test(serial)) {
      alert("Serial must contain only letters, numbers, or hyphens (max 30 characters).");
      return;
    }

    if (isNaN(stock) || stock < 0 || stock > 1000) {
      alert("Stock must be a number between 0 and 1000.");
      return;
    }

    const newItem = {
      category: document.getElementById("category").value,
      brand,
      name,
      serial,
      stock,
      status: document.getElementById("status").value,
    };

    if (editingId) {
      // Update item
      await fetch(`/items/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      editingId = null;
    } else {
      // Add new item
      await fetch("/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
    }

    addForm.reset();
    fetchItems();
  });

  // Handle search
  searchBar.addEventListener("input", () => {
    const keyword = searchBar.value.toLowerCase();
    const filteredItems = allItems.filter((item) => {
      return (
        item.category.toLowerCase().includes(keyword) ||
        item.brand.toLowerCase().includes(keyword) ||
        item.name.toLowerCase().includes(keyword) ||
        item.serial.toLowerCase().includes(keyword) ||
        item.status.toLowerCase().includes(keyword)
      );
    });
    renderItems(filteredItems);
  });

  // Load and save task notes
  const savedNotes = localStorage.getItem("taskNotes");
  if (savedNotes) {
    taskNotes.value = savedNotes;
  }

  saveBtn.addEventListener("click", () => {
    localStorage.setItem("taskNotes", taskNotes.value);
    alert("Notes saved!");
  });

  clearBtn.addEventListener("click", () => {
    taskNotes.value = "";
    localStorage.removeItem("taskNotes");
  });

  // Initial load
  fetchItems();
});
