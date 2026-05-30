      const navbar = document.getElementById("navbar");
      const menuToggle = document.getElementById("menuToggle");
      const enquiryForm = document.getElementById("enquiryForm");
      const toast = document.getElementById("toast");

      menuToggle.addEventListener("click", () => {
        const isOpen = navbar.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
      });

      document.querySelectorAll(".nav-links a").forEach((link) => {
        link.addEventListener("click", () => {
          navbar.classList.remove("open");
          menuToggle.setAttribute("aria-expanded", "false");
        });
      });

      const floatCards = document.querySelectorAll(".amenity, .price-card, .review, .landmark");

      floatCards.forEach((card) => {
        card.addEventListener("pointermove", (event) => {
          const rect = card.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * 100;
          const y = ((event.clientY - rect.top) / rect.height) * 100;
          const tiltY = (x - 50) * 0.08;
          const tiltX = (50 - y) * 0.08;

          card.style.setProperty("--mx", `${x}%`);
          card.style.setProperty("--my", `${y}%`);
          card.style.setProperty("--tiltX", `${tiltX}deg`);
          card.style.setProperty("--tiltY", `${tiltY}deg`);
        });

        card.addEventListener("pointerleave", () => {
          card.style.setProperty("--mx", "50%");
          card.style.setProperty("--my", "50%");
          card.style.setProperty("--tiltX", "0deg");
          card.style.setProperty("--tiltY", "0deg");
        });
      });

      enquiryForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(enquiryForm);
        const message = [
          "Hi Vara Grand, I want to enquire about rooms.",
          `Name: ${data.get("name") || ""}`,
          `Phone: ${data.get("phone") || ""}`,
          `Room type: ${data.get("room") || ""}`,
          `Move-in date: ${data.get("movein") || ""}`,
          `Message: ${data.get("message") || ""}`
        ].join("\n");

        toast.classList.add("show");
        window.setTimeout(() => toast.classList.remove("show"), 2600);
        window.open(`https://wa.me/918460282338?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      });
