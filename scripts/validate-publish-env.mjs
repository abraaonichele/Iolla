const requiredVariables = [
  "GITHUB_TOKEN",
  "GH_OWNER",
  "GH_REPO"
];

const missingVariables = requiredVariables.filter((variableName) => !process.env[variableName]);

if (missingVariables.length > 0) {
  console.error("Faltam variáveis de ambiente para publicar a atualização:");
  for (const variableName of missingVariables) {
    console.error(`- ${variableName}`);
  }
  console.error(
    "Defina essas variáveis antes de rodar npm run publish:win ou npm run publish:mac."
  );
  process.exit(1);
}

console.log(
  `Publicação configurada para ${process.env.GH_OWNER}/${process.env.GH_REPO}.`
);
