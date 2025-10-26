// Przełączanie motywu jasny/ciemny
const themeToggle = document.getElementById("themeToggle")
const body = document.body

// Sprawdź zapisany motyw w localStorage
const savedTheme = localStorage.getItem("theme") || "light"
body.setAttribute("data-theme", savedTheme)
updateThemeButton(savedTheme)

themeToggle.addEventListener("click", () => {
    const currentTheme = body.getAttribute("data-theme")
    const newTheme = currentTheme === "light" ? "dark" : "light"

    body.setAttribute("data-theme", newTheme)
    localStorage.setItem("theme", newTheme)
    updateThemeButton(newTheme)
})

function updateThemeButton(theme) {
    const icon = theme === "light" ? "🌙" : "☀️"
    const textPl = theme === "light" ? "Tryb ciemny" : "Tryb jasny"
    const textEn = theme === "light" ? "Dark mode" : "Light mode"

    themeToggle.querySelector(".lang-pl").textContent = `${icon} ${textPl}`
    themeToggle.querySelector(".lang-en").textContent = `${icon} ${textEn}`
}

// Przełączanie języka
const langToggle = document.getElementById("langToggle")

// Sprawdź zapisany język w localStorage
const savedLang = localStorage.getItem("lang") || "pl"
body.setAttribute("data-lang", savedLang)

langToggle.addEventListener("click", () => {
    const currentLang = body.getAttribute("data-lang")
    const newLang = currentLang === "pl" ? "en" : "pl"

    body.setAttribute("data-lang", newLang)
    localStorage.setItem("lang", newLang)
})

// Obsługa przycisków CTA (przykładowa funkcjonalność)
const ctaButtons = document.querySelectorAll(".btn")
ctaButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
        const buttonText = e.target.textContent.trim()
        if (buttonText.includes("Zarejestruj") || buttonText.includes("Sign up")) {
            alert(
                body.getAttribute("data-lang") === "pl"
                    ? "Przekierowanie do strony rejestracji..."
                    : "Redirecting to registration page...",
            )
        } else if (buttonText.includes("Zaloguj") || buttonText.includes("Log in")) {
            alert(
                body.getAttribute("data-lang") === "pl"
                    ? "Przekierowanie do strony logowania..."
                    : "Redirecting to login page...",
            )
        }
    })
})

// Animacja pojawienia się kart funkcji przy przewijaniu
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "0"
            entry.target.style.transform = "translateY(20px)"

            setTimeout(() => {
                entry.target.style.transition = "all 0.6s ease"
                entry.target.style.opacity = "1"
                entry.target.style.transform = "translateY(0)"
            }, 100)

            observer.unobserve(entry.target)
        }
    })
}, observerOptions)

// Obserwuj wszystkie karty funkcji
document.querySelectorAll(".feature-card").forEach((card) => {
    observer.observe(card)
})
