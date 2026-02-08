document.addEventListener("DOMContentLoaded", () => {
  const range = document.getElementById("lumiere");
  const light = document.querySelector(".light");
  const text = document.querySelector(".text-espoir");
  const lampGradiant = document.querySelector(".gradiant-light");
  const lampBot = document.querySelector(".bot");

  range.addEventListener("input", (e) => {
    const val = e.target.value;
    const opacity = val / 100;

    light.style.opacity = opacity;
    text.style.opacity = opacity;
    lampGradiant.style.opacity = opacity;

    const colorVal = 51 + Math.floor((255 - 51) * opacity);
    lampBot.style.backgroundColor = `rgb(${colorVal}, ${colorVal}, ${colorVal})`;

    const blurVal = 10 - val / 10;
    text.style.filter = `blur(${blurVal}px)`;
  });
});
