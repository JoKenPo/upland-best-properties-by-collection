const fs = require("fs");
const path = require("path");

// Caminho para o arquivo properties.json
const propertiesPath = path.join(__dirname, "properties.json");
const properties = JSON.parse(fs.readFileSync(propertiesPath, "utf-8"));

// Agrupa as propriedades por bairro e encontra a mais cara em cada bairro
const propertiesByNeighborhood = properties.reduce((acc, property) => {
  const { neighborhood_name, price } = property;
  if (!acc[neighborhood_name] || acc[neighborhood_name].price < price) {
    acc[neighborhood_name] = property;
  }
  return acc;
}, {});

// Caminho para o diretório results
const outputDir = path.join(__dirname, "results");

// Cria o diretório results se não existir
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Gera um arquivo para cada bairro com as informações solicitadas
Object.keys(propertiesByNeighborhood).forEach((neighborhood) => {
  const property = propertiesByNeighborhood[neighborhood];
  const result = {
    neighborhood: neighborhood,
    full_address: property.full_address,
    city: property.city.name,
    state: property.state.name,
    initial_price: property.initial_price,
    collection_boost: property.collection_boost || null,
  };

  const outputPath = path.join(outputDir, `${neighborhood}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");
});

console.log("Os arquivos foram gerados na pasta results.");
