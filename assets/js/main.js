const pokemonList = document.getElementById("pokemonList");
const loadMoreButton = document.getElementById("loadMoreButton");

const maxRecords = 151;
const limit = 10;
let offset = 0;

function convertPokemonToLi(pokemon) {
  return `
        <li class="pokemon ${pokemon.type}" data-id="${pokemon.number}">
            <span class="number">#${pokemon.number}</span>
            <span class="name">${pokemon.name}</span>

            <div class="detail">
                <ol class="types">
                    ${pokemon.types
                      .map((type) => `<li class="type ${type}">${type}</li>`)
                      .join("")}
                </ol>

                <img src="${pokemon.photo}"
                     alt="${pokemon.name}">
            </div>
        </li>
    `;
}

function loadPokemonItens(offset, limit) {
  pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
    const newHtml = pokemons.map(convertPokemonToLi).join("");
    pokemonList.innerHTML += newHtml;

    // Adiciona evento de clique para abrir modal
    document.querySelectorAll(".pokemon").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-id");

        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
          .then((res) => res.json())
          .then((data) => openModal(data));
      });
    });
  });
}

function openModal(pokemonData) {
  const modal = document.getElementById("pokemonModal");
  const modalContent = modal.querySelector(".modal-content");
  const modalBody = document.getElementById("modalBody");

  // Reseta classes, mantém só modal-content
  modalContent.className = "modal-content";

  // Pega o tipo principal e adiciona a classe para cor
  const mainType = pokemonData.types[0].type.name;
  modalContent.classList.add(mainType);

  // Função auxiliar para formatar os stats
  function formatStats(stats) {
    return stats
      .map(
        (stat) =>
          `<li><strong>${stat.stat.name
            .replace("special-", "SP ")
            .toUpperCase()}:</strong> ${stat.base_stat}</li>`
      )
      .join("");
  }

  // Pega os primeiros 5 movimentos
  const firstFiveMoves = pokemonData.moves
    .slice(0, 5)
    .map((move) => move.move.name)
    .join(", ");

  // Buscar dados extras do Pokémon (espécie) para saber se é lendário ou mítico
  fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonData.id}`)
    .then((res) => res.json())
    .then((speciesData) => {
      const isLegendary = speciesData.is_legendary ? "Sim" : "Não";
      const isMythical = speciesData.is_mythical ? "Sim" : "Não";

      modalBody.innerHTML = `
        <img src="${
          pokemonData.sprites.other.dream_world.front_default
        }" alt="${pokemonData.name}">
        <h2>${pokemonData.name} (#${pokemonData.id})</h2>
        <p><strong>Altura:</strong> ${pokemonData.height / 10} m</p>
        <p><strong>Peso:</strong> ${pokemonData.weight / 10} kg</p>
        <p><strong>Tipos:</strong> ${pokemonData.types
          .map((t) => t.type.name)
          .join(", ")}</p>
        <p><strong>Habilidades:</strong> ${pokemonData.abilities
          .map((a) => a.ability.name)
          .join(", ")}</p>

        <h3>Status Base:</h3>
        <ul>
          progress>${formatStats(pokemonData.stats)}
        </ul>

        <p><strong>Lendário:</strong> ${isLegendary}</p>
        <p><strong>Mítico:</strong> ${isMythical}</p>

        <p><strong>Movimentos (5 primeiros):</strong> ${firstFiveMoves}</p>
      `;

      modal.style.display = "block";
    });
}

// Fechar modal ao clicar no X
document.querySelector(".close-btn").addEventListener("click", () => {
  document.getElementById("pokemonModal").style.display = "none";
});

// Fechar modal ao clicar fora do conteúdo
window.addEventListener("click", (e) => {
  const modal = document.getElementById("pokemonModal");
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

loadPokemonItens(offset, limit);

loadMoreButton.addEventListener("click", () => {
  offset += limit;
  const qtdRecordsWithNexPage = offset + limit;

  if (qtdRecordsWithNexPage >= maxRecords) {
    const newLimit = maxRecords - offset;
    loadPokemonItens(offset, newLimit);

    loadMoreButton.parentElement.removeChild(loadMoreButton);
  } else {
    loadPokemonItens(offset, limit);
  }
});
