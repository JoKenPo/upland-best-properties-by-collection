const fs = require("fs");
const properties = require("./properties.json");
const collections = require("./collections.json");

// Função para calcular o valor total de uma coleção
function calculateCollectionTotal(collection) {
  return collection.properties.reduce(
    (total, property) => total + property.initial_price,
    0
  );
}

// Ordenar propriedades por valor inicial (decrescente)
const sortedProperties = properties.sort(
  (a, b) => b.initial_price - a.initial_price
);

// Inicializar coleções com as propriedades atribuídas
let collectionsWithProperties = collections.map((collection) => ({
  ...collection,
  properties: [],
}));

// Atribuir propriedades às coleções
sortedProperties.forEach((property) => {
  let added = false;

  // Ordenar coleções pelo boost decrescente
  collectionsWithProperties.sort((a, b) => b.boost - a.boost);

  for (let i = 0; i < collectionsWithProperties.length; i++) {
    const collection = collectionsWithProperties[i];

    // Verificar se a propriedade atende aos critérios da coleção
    if (collection.properties.length < (collection.maxProperties || Infinity)) {
      if (collection.neighborhood) {
        if (property.neighborhood_name === collection.neighborhood) {
          collection.properties.push({
            full_address: property.full_address,
            initial_price: property.initial_price,
          });
          added = true;
          break;
        }
      } else {
        collection.properties.push({
          full_address: property.full_address,
          initial_price: property.initial_price,
        });
        added = true;
        break;
      }
    }
  }

  // Se não foi adicionada a nenhuma coleção, adicionar a "EXCLUDED"
  if (!added) {
    collectionsWithProperties[
      collectionsWithProperties.length - 1
    ].properties.push({
      full_address: property.full_address,
      initial_price: property.initial_price,
    });
  }
});

// Remover propriedades vazias e calcular o valor total de cada coleção
collectionsWithProperties = collectionsWithProperties.filter(
  (collection) => collection.properties.length > 0
);
collectionsWithProperties.forEach((collection) => {
  collection.total_value = calculateCollectionTotal(collection);
});

// Adicionar a coleção "EXCLUDED" para as propriedades não atribuídas
const excludedProperties = sortedProperties.filter(
  (property) =>
    !collectionsWithProperties.some((collection) =>
      collection.properties.some(
        (prop) => prop.full_address === property.full_address
      )
    )
);
const excludedCollection = {
  name: "EXCLUDED",
  properties: excludedProperties.map((property) => ({
    full_address: property.full_address,
    initial_price: property.initial_price,
  })),
};
if (excludedCollection.properties.length > 0) {
  collectionsWithProperties.push(excludedCollection);
}

// Ordenar coleções pelo valor total decrescente
collectionsWithProperties.sort((a, b) => b.total_value - a.total_value);

// Formatar o resultado para corresponder ao requisitado
const formattedResult = collectionsWithProperties.map((collection) => ({
  name: collection.name,
  properties: collection.properties.map((property) => ({
    full_address: property.full_address,
    initial_price: property.initial_price,
  })),
  boost: collection.boost,
}));

// Salvar o resultado em um arquivo output.json
fs.writeFileSync("output.json", JSON.stringify(formattedResult, null, 2));

console.log("Resultado salvo em output.json");
