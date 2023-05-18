class FileTree extends HTMLElement {
    connectedCallback() {
      const filesFolders = JSON.parse(this.getAttribute("data-files-folders"));
  
      const fileTree = this.buildFileTree(filesFolders);
      this.appendChild(fileTree);
    }
  
    buildFileTree(filesFolders) {
      const rootFolder = document.createElement("div");
      rootFolder.classList.add("file-tree");
  
      const foldersMap = new Map();
  
      for (const fileFolder of filesFolders) {
        const fullPath = fileFolder.path;
        const fileName = fileFolder.name;
  
        let currentFolder = rootFolder;
  
        const pathParts = fullPath.split("/");
        pathParts.pop(); // Remove the file name from the path
  
        for (const folder of pathParts) {
          const folderKey = folder + "/";
          let folderElement = foldersMap.get(folderKey);
  
          if (!folderElement) {
            folderElement = this.createFolderElement(folder);
            foldersMap.set(folderKey, folderElement);
            currentFolder.appendChild(folderElement);
          }
  
          currentFolder = folderElement.querySelector(".nested");
        }
  
        const fileElement = this.createFileElement(fileName);
        currentFolder.appendChild(fileElement);
      }
  
      return rootFolder;
    }
  
    createFolderElement(folderName) {
      const folderElement = document.createElement("details");
      folderElement.classList.add("folder");
  
      const summaryElement = document.createElement("summary");
      summaryElement.textContent = folderName;
      folderElement.appendChild(summaryElement);
  
      const nestedFolder = document.createElement("div");
      nestedFolder.classList.add("nested");
      folderElement.appendChild(nestedFolder);
  
      return folderElement;
    }
  
    createFileElement(fileName) {
      const fileElement = document.createElement("div");
      fileElement.classList.add("file");
  
      const fileLinkElement = document.createElement("a");
      fileLinkElement.href = "#";
      fileLinkElement.textContent = fileName;
      fileElement.appendChild(fileLinkElement);
  
      return fileElement;
    }
  }
  
  customElements.define("file-tree", FileTree);
  