document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
  
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  
    if (res.ok) {
      window.location.href = "/index.html";
    } else {
      const result = await res.json();
      document.getElementById("errorMessage").textContent = result.message || "Login failed";
    }
  });
  