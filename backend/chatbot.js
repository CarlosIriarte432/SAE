const API_URL = "https://sae-08mf.onrender.com/api/chat";

function toggleChat() {
    const chatWindow = document.getElementById("chat-window");
    const iconOpen = document.getElementById("chat-icon-open");
    const iconClose = document.getElementById("chat-icon-close");

    chatWindow.classList.toggle("hidden");
    iconOpen.classList.toggle("hidden");
    iconClose.classList.toggle("hidden");

    if (!chatWindow.classList.contains("hidden")) {
        document.getElementById("userInput").focus();
    }
}

async function sendMessage() {
    const inputField = document.getElementById("userInput");
    const userMessage = inputField.value.trim();

    if (!userMessage) return;

    appendMessage(userMessage, "user");
    inputField.value = "";

    const loadingId = appendMessage("Buscando información...", "bot");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage })
        });

        const data = await response.json();
        const loadingElem = document.getElementById(loadingId);
        if (loadingElem) loadingElem.remove();

        if (response.ok && data.choices && data.choices[0].message.content) {
            let botReply = data.choices[0].message.content;
            
            // Limpieza de formato markdown
            botReply = botReply.replaceAll('**', '').replaceAll('*', '');
            appendMessage(botReply, "bot");

            // Evaluación de intención de contacto / cotización adaptada a SAE
            const contactKeywords = ['contacto', 'cotizar', 'cotización', 'transporte', 'logística', 'contact', 'quote', 'freight', 'logistics'];
            const requiresContact = contactKeywords.some(keyword => botReply.toLowerCase().includes(keyword));

            if (requiresContact) {
                appendContactActions();
            }
        } else {
            console.error("Error API:", data.error || data);
            appendMessage(`Ocurrió un error al procesar tu solicitud.`, "bot");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        const loadingElem = document.getElementById(loadingId);
        if (loadingElem) loadingElem.remove();
        appendMessage("Error al conectar con el asistente. Verifica que el servidor local esté corriendo.", "bot");
    }
}

function appendMessage(text, sender) {
    const chatBox = document.getElementById("chatBox");
    const msgDiv = document.createElement("div");
    const uniqueId = "msg-" + Date.now() + Math.floor(Math.random() * 1000);
    
    msgDiv.id = uniqueId;
    msgDiv.classList.add("message", "p-3", "rounded-2xl", "max-w-[85%]", "text-sm", "leading-relaxed", "shadow-sm");
    
    if (sender === "user") {
        // Estilo usuario: Azul SAE (#004b93)
        msgDiv.classList.add("bg-[#004b93]", "text-white", "self-end", "rounded-br-sm");
    } else {
        // Estilo bot: Blanco/Gris
        msgDiv.classList.add("bg-white", "border", "border-slate-200", "text-slate-700", "self-start", "rounded-bl-sm");
    }
    
    msgDiv.textContent = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    return uniqueId;
}

function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

function appendContactActions() {
    const chatBox = document.getElementById("chatBox");
    const actionsDiv = document.createElement("div");
    
    actionsDiv.classList.add("flex", "gap-2", "mt-2", "mb-3", "self-start");

    const formBtn = document.createElement("button");
    formBtn.onclick = () => {
        document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' });
        toggleChat(); 
    };
    
    // Estilos alineados con la paleta de SAE (Navy a Blue)
    formBtn.classList.add("bg-[#06152d]", "text-white", "font-industrial", "uppercase", "tracking-wider", "text-xs", "font-bold", "px-4", "py-2.5", "rounded-lg", "shadow-sm", "hover:bg-[#004b93]", "transition-colors");
    formBtn.textContent = "Ir a Formulario de Cotización";

    actionsDiv.appendChild(formBtn);
    chatBox.appendChild(actionsDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}