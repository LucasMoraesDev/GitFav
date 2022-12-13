import { GithubUser } from "./GithubUser.js";

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@gitfav:")) || [];
  }

  save() {
    localStorage.setItem("@gitfav:", JSON.stringify(this.entries));
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username)
      if(userExists) {
        throw new Error("Usuário já cadastrado")
      }

      const user = await GithubUser.seach(username);
      const isUndefined = user.login == undefined;
      if (isUndefined) {
        throw new Error("Usuário não encontrado!");
      }
      const oldEntries = [...this.entries]
      this.entries = [user, ...oldEntries];
      this.update();
      this.save();
    } catch (error) {
      alert(error.message);
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      (entry) => entry.login !== user.login
    );

    this.entries = filteredEntries;
    this.update();
    this.save();
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);
    this.tbody = this.root.querySelector("table tbody");
    this.update();
    this.onAdd();
    // localStorage.clear()
  }

  onAdd() {
    const addButton = this.root.querySelector(".search button");
    addButton.onclick = () => {
      let { value } = this.root.querySelector(".search input");
      this.add(value);
      this.root.querySelector(".search input").value = "";
    };
  }

  update() {
    this.removeAllTr();
    this.createAllRows();
  }

  createAllRows() {
    let allEntries = this.entries || [];
    console.log(allEntries);
    allEntries.forEach((user) => {
      this.createRow(user);
    });
  }

  createRow(user) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
    <td class="user">
      <img
        src="https://github.com/${user.login}.png"
        alt="Imagem de ${user.login}"
      />
      <a href="https://github.com/${user.login}" target="_blank">
        <p>${user.name}</p>
        <span>${user.login}</span>
      </a>
    </td>
    <td class="repositories">${user.public_repos}</td>
    <td class="followers">${user.followers}</td>
    <td><button class="remove">Remover</button></td>
    `;

    tr.querySelector(".remove").addEventListener("click", () => {
      const isOK = confirm("Tem certeza que deseja deletar essa linha?");
      if (isOK) {
        this.delete(user);
      }
    });
    this.tbody.append(tr);
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }
}