document.addEventListener("DOMContentLoaded", () => {
    const content = document.getElementById('content');

    const savedContentFontSize = localStorage.getItem('storyContentFontSize');
    if (savedContentFontSize) {
        content.style.fontSize = savedContentFontSize;
    }

    const controlsDiv = document.createElement('div');
    controlsDiv.id = 'controls';

    function add_button(matIconName, disabled = true) {
        const button = document.createElement('button');
        button.disabled = disabled;

        const iconSpan = document.createElement('span');
        iconSpan.className = 'material-symbols-outlined';
        iconSpan.textContent = matIconName;
        button.appendChild(iconSpan);

        controlsDiv.appendChild(button);
        return button;
    }

    const selectBtn = add_button('select_to_speak');
    const readAloudBtn = add_button('campaign');
    const stopBtn = add_button('stop');
    const pauseBtn = add_button('pause');
    const resumeBtn = add_button('resume');
    const decFontBtn = add_button('text_decrease');
    const incFontBtn = add_button('text_increase');

    document.body.appendChild(controlsDiv);

    const toastDiv = document.createElement('div');
    toastDiv.className = 'toast';
    document.body.appendChild(toastDiv);

    let utterance = null;
    let currentStoryContent = null;
    let currentStoryHTML = null;
    let isPlaying = false;
    let currentWordIndex = 0;
    let words = [];
    let globalStoryIndex = 1;

    // Load books
    books.forEach((book, bookIndex) => {
        const bookDiv = document.createElement("div");
        bookDiv.className = "book";

        const storyCount = book.stories.length;
        const bookTitle = document.createElement("div");
        bookTitle.className = "book-title";
        bookTitle.innerHTML = `<span class="index">${bookIndex + 1}.</span> ${book.title} (${storyCount} ${storyCount === 1 ? 'Story' : 'Stories'})`;
        bookTitle.addEventListener("click", () => toggleBook(bookDiv));
        bookDiv.appendChild(bookTitle);

        const storiesDiv = document.createElement("div");
        storiesDiv.className = "stories";
        storiesDiv.style.display = "none";

        book.stories.forEach((story, storyIndex) => {
            const storyDiv = document.createElement("div");
            storyDiv.className = "story";

            const storyTitle = document.createElement("div");
            storyTitle.className = "story-title";
            storyTitle.textContent = `${globalStoryIndex++}. ${story.title}`;
            storyTitle.addEventListener("click", () => toggleStory(storyDiv, story));
            storyDiv.appendChild(storyTitle);

            const storyContent = document.createElement("div");
            storyContent.className = "story-content";
            storyContent.style.display = "none";

            const narrativeDiv = document.createElement("div");
            narrativeDiv.className = "story-narrative";
            story.paragraphs.forEach((paragraph) => {
                const p = document.createElement("p");
                p.innerHTML = beautifyQuotes(paragraph);
                narrativeDiv.appendChild(p);
            });

            const moralDiv = document.createElement("div");
            moralDiv.className = "story-moral";
            moralDiv.innerHTML = `<p>${story.moral}</p>`;

            storyContent.appendChild(narrativeDiv);
            storyContent.appendChild(moralDiv);
            storyDiv.appendChild(storyContent);
            storiesDiv.appendChild(storyDiv);
        });

        bookDiv.appendChild(storiesDiv);
        content.appendChild(bookDiv);
    });

    function beautifyQuotes(text) {
        const regex = /"([^"]+)"/g;
        let match;
        let result = '';
        let lastIndex = 0;

        while ((match = regex.exec(text)) !== null) {
            result += text.slice(lastIndex, match.index);
            result += `<span class="quoted-text">${match[0]}</span>`;

            lastIndex = regex.lastIndex;
        }

        result += text.slice(lastIndex);
        return result;
    }

    // Toggle book visibility
    function toggleBook(bookDiv) {
        const storiesDiv = bookDiv.querySelector(".stories");
        const isOpen = storiesDiv.style.display === "block";

        // Close all books
        document.querySelectorAll(".stories").forEach((div) => {
            div.style.display = "none";
        });

        // Open the selected book
        if (!isOpen) {
            storiesDiv.style.display = "block";
            bookDiv.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
        }
    }

    // Toggle story visibility
    function toggleStory(storyDiv, story) {
        const storyContent = storyDiv.querySelector(".story-content");
        const isOpen = storyContent.style.display === "block";

        // Close all stories
        document.querySelectorAll(".story-content").forEach((div) => {
            div.style.display = "none";
        });

        readAloudBtn.disabled = isOpen;
        selectBtn.disabled = isOpen;
        incFontBtn.disabled = isOpen;
        decFontBtn.disabled = isOpen;

        // Open the selected story
        if (!isOpen) {
            storyContent.style.display = "block";
            currentStoryContent = storyContent;
            words = story.paragraphs.join(" ").split(" ");
            currentWordIndex = 0;
            storyDiv.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
        } else {
            (storyDiv.previousElementSibling || storyDiv.parentNode.parentNode).
                scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" }); // Scroll to story title
        }
    }

    // Read aloud functionality
    function readStory() {
        if (!currentStoryContent) return;

        const content = words.join(" ");
        currentStoryHTML = currentStoryContent.innerHTML;
        utterance = new SpeechSynthesisUtterance(content);
        speechSynthesis.speak(utterance);
        isPlaying = true;
        pauseBtn.disabled = false;
        resumeBtn.disabled = true;
        stopBtn.disabled = false;

        utterance.onboundary = (event) => {
            if (currentWordIndex >= words.length) return;

            const word = words[currentWordIndex];
            const wordStart = event.charIndex;
            const wordEnd = wordStart + (word.length > 10 ? word.length : 10);

            // Highlight the current word
            currentStoryContent.innerHTML = beautifyQuotes(`${content.slice(0, wordStart)}<span class='highlight'>${content.slice(wordStart, wordEnd)}</span>${content.slice(wordEnd)}`);
            currentWordIndex++;

            // Scroll to the highlighted word
            const highlightedElement = currentStoryContent.querySelector(".highlight");
            if (highlightedElement) {
                highlightedElement.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        };

        utterance.onend = () => {
            isPlaying = false;
            pauseBtn.disabled = true;
            resumeBtn.disabled = true;
            stopBtn.disabled = true;
            currentStoryContent.innerHTML = currentStoryHTML;
        };
    }

    // Pause functionality
    pauseBtn.addEventListener("click", () => {
        if (isPlaying) {
            speechSynthesis.pause();
            isPlaying = false;
            pauseBtn.disabled = true;
            resumeBtn.disabled = false;
        }
    });

    // Resume functionality
    resumeBtn.addEventListener("click", () => {
        if (!isPlaying) {
            speechSynthesis.resume();
            isPlaying = true;
            pauseBtn.disabled = false;
            resumeBtn.disabled = true;
        }
    });

    // Stop functionality
    stopBtn.addEventListener("click", () => {
        if (utterance) {
            speechSynthesis.cancel();
            isPlaying = false;
            pauseBtn.disabled = true;
            resumeBtn.disabled = true;
            stopBtn.disabled = true;
            readAloudBtn.disabled = false;
            currentStoryContent.innerHTML = currentStoryHTML
        }
    });

    // Add event listener to Select Text button
    selectBtn.addEventListener("click", () => {
        if (currentStoryContent) {
            const range = document.createRange();
            range.selectNodeContents(currentStoryContent);

            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            toast('Touch and Hold, then choose "Read Aloud"');
        }
    });

    // Add event listener to Read Aloud button
    readAloudBtn.addEventListener("click", () => {
        if (currentStoryContent) {
            readAloudBtn.disabled = true;
            readStory();
        }
    });

    function toast(message) {
        toastDiv.classList.add("show");
        toastDiv.textContent = message
        setTimeout(() => {
            toastDiv.classList.remove("show");
        }, 2000);
    }

    function changeFontSize(step) {
        let fontSize = parseFloat(window.getComputedStyle(content).fontSize);
        fontSize += step;
        content.style.fontSize = `${fontSize}px`;
        localStorage.setItem('storyContentFontSize', `${fontSize}px`);
    }

    incFontBtn.addEventListener('click', () => {
        changeFontSize(2);
    });

    decFontBtn.addEventListener('click', () => {
        changeFontSize(-2);
    });
});