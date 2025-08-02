
## 1. `SearchBar` Component Requirements (`SearchBar.md`)

````markdown
# SearchBar Component – Now Playing App

## Purpose

The `SearchBar` component provides the primary text input interface for users to enter movie-related search queries. It is used on the Home page and other places where movie discovery is initiated.

---

## Props

```tsx
<SearchBar
  onSearch={(query: string) => void}
  placeholder="Search for movies..."
  className="home-search"
/>
````

* `onSearch`: A function to call when the user submits a search
* `placeholder`: Optional placeholder text for the input
* `className`: Optional CSS or Tailwind class for outer layout styling

---

## Functional Requirements

* The search field accepts free-text input (movie titles, actors, genres)
* Hitting enter or clicking a submit button triggers `onSearch(query)`
* Query string should be trimmed before submission
* Enter key should be supported for submission
* The input must be keyboard and screen reader accessible
* Use controlled input behavior (internal state to hold the current value)

---

## Layout & Styling

* Full width container with max-width (600px suggested on Home page)
* Rounded input with clear focus and hover states
* Optionally include a submit button (text-only; no icons)
* Border and background colors should match the current theme (white on dark backgrounds)

---

## Behavior

* Prevent double submission by disabling submit briefly after trigger (optional)
* Do not submit empty or whitespace-only queries
* Input should auto-focus when rendered (optional on Home page)

---

## Usage Example

```tsx
const handleSearch = (query: string) => {
  navigate(`/search?q=${encodeURIComponent(query)}`);
};

<SearchBar
  onSearch={handleSearch}
  placeholder="Search for movies, directors, or genres..."
/>
```

````

---

## 2. Background Animation Elements (`HomeBackground.md`)

```markdown
# Background Motion Elements – Now Playing App Home Page

## Purpose

The Home page background includes two circular, glowing, animated visual elements that float up and down in the background. These elements provide subtle visual motion and depth without interfering with content.

---

## Description

Two floating elements are rendered using Framer Motion:

- **Top Right Circle**
  - Positioned: absolute, top 10%, right 10%
  - Size: 300px x 300px
  - Style: radial gradient, faded blue outer ring
  - Animation: float up and down (y-axis), 0 → 15px → 0
  - Duration: 8 seconds, infinite loop, easeInOut

- **Bottom Left Circle**
  - Positioned: absolute, bottom 15%, left 8%
  - Size: 200px x 200px
  - Style: radial gradient, faded violet outer ring
  - Animation: float down and up (y-axis), 15px → 0 → 15px
  - Duration: 10 seconds, infinite loop, easeInOut, with delay

---

## Technical Requirements

- Use Framer Motion `animate={{ y: [...] }}` syntax
- Each shape should have its own motion element with independent timing
- Use Tailwind or MUI `sx` to set absolute position, opacity, and gradient background
- Ensure both shapes are `z-index: 0` so they appear behind foreground content

---

## Styling

- Opacity around 0.7
- Use radial gradients:
  - Top-right: rgba(96, 165, 250, 0.1) center, fade to transparent
  - Bottom-left: rgba(139, 92, 246, 0.1) center, fade to transparent
- Border radius: 50% to create circular shapes
- No borders, shadows, or additional elements

---

## Notes

- These elements are decorative only; no interactivity or semantic content
- Ensure they do not shift layout or overlap text
- Motion should remain subtle on small screens
````

---

Here is a **code-focused version of the `SearchBar` component requirements**, written as an inline prompt you can feed directly into AI tools like Windsurf, GPT, or Copilot Chat to generate the actual component.

It’s written with **clear instruction-style directives**, and omits any prose, icons, or markdown.

---

**Prompt:**

Build a reusable React component called `SearchBar` with the following features:

* Controlled input field for text search
* Accepts three props:

  * `onSearch(query: string)`: required callback triggered on submit
  * `placeholder?: string`: optional input placeholder text
  * `className?: string`: optional wrapper class for layout styling

**Behavior:**

* When the user presses Enter or submits the form, trim the input
* If the trimmed query is not empty, call `onSearch(query)`
* Prevent blank or whitespace-only queries from being submitted
* Optionally include a submit button (text-based, no icons)
* Input should be accessible (label or aria-label)
* Input should be auto-focused when rendered (optional prop or default true)

**Styling:**

* The outer wrapper div uses `className` passed in
* Input field should be full width, with max-width configurable from parent
* Rounded borders, subtle shadow on focus
* Responsive to light or dark themes if applicable

**Example usage:**

```tsx
<SearchBar
  onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)}
  placeholder="Search for movies, directors, or genres..."
  className="max-w-xl mx-auto"
/>
```

Do not use icons, emojis, or images. Output the component in a single `.tsx` file.

---


