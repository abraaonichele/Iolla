const githubOwner = process.env.GH_OWNER || process.env.IOLLA_GH_OWNER;
const githubRepo = process.env.GH_REPO || process.env.IOLLA_GH_REPO;

const publish =
  githubOwner && githubRepo
    ? [
        {
          provider: "github",
          owner: githubOwner,
          repo: githubRepo,
          private: false,
          channel: "latest",
          releaseType: "release"
        }
      ]
    : undefined;

module.exports = {
  appId: "com.iolla.desktop",
  productName: "IOLLA",
  asar: true,
  directories: {
    buildResources: "build",
    output: "release"
  },
  files: ["dist/**/*", "electron/**/*", "package.json"],
  publish,
  mac: {
    icon: "icon.icns",
    category: "public.app-category.business",
    target: [
      {
        target: "dmg",
        arch: ["arm64"]
      },
      {
        target: "zip",
        arch: ["arm64"]
      }
    ],
    artifactName: "${productName}-Installer-${version}-${arch}.${ext}"
  },
  win: {
    icon: "icon.ico",
    target: [
      {
        target: "nsis",
        arch: ["x64"]
      }
    ],
    artifactName: "${productName}-Installer-${version}-${arch}.${ext}"
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "IOLLA"
  }
};
