const books = [];
const RENDER_EVENT = "render-book";

const title = document.getElementById("inputBookTitle");
const author = document.getElementById("inputBookAuthor");
const years = document.getElementById("inputBookYear");
const check = document.getElementById("inputBookIsComplete");

function generateId() {
  return +new Date();
}

function addBook() {
  const generateID = generateId();
  const bookObject = generateBook(generateID, title.value, author.value, years.value, check.checked);
  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateBook(id, title, author, years, isCompleted) {
  return {
    id,
    title,
    author,
    years,
    isCompleted,
  };
}

function makeBook(book) {
  const title = document.createElement("h3");
  title.innerText = book.title;

  const author = document.createElement("p");
  author.innerText = book.author;

  const years = document.createElement("p");
  years.innerText = book.years;

  const container = document.createElement("article");
  container.append(title, author, years);
  container.classList.add("book_item");
  container.setAttribute("id", book.id);

  const action = document.createElement("div");
  action.classList.add("action");

  const deleteBook = document.createElement("button");
  deleteBook.innerText = "Hapus Buku";
  deleteBook.classList.add("red");

  // Menghapus Buku
  deleteBook.addEventListener("click", function () {
    for (let index = 0; index < books.length; index++) {
      if (books[index].id == book.id) {
        books.splice(index, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
      }
    }
  });

  if (book.isCompleted) {
    const undoBook = document.createElement("button");
    undoBook.innerText = "Belum Selesai Dibaca";
    undoBook.classList.add("green");

    // Mengembalikan Buku ke Rak awal
    undoBook.addEventListener("click", function () {
      book.isCompleted = false;
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
    });

    action.append(undoBook, deleteBook);
    container.append(action);
  } else {
    const unFinish = document.createElement("button");
    unFinish.innerText = "Selesai Dibaca";
    unFinish.classList.add("green");

    // Menambahkan Buku ke Selesai di Baca
    unFinish.addEventListener("click", function () {
      book.isCompleted = true;
      unFinish.classList.add("red");
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
    });

    action.append(unFinish, deleteBook);
    container.append(action);
  }

  return container;
}

document.addEventListener("DOMContentLoaded", function () {
  const submitBook = document.getElementById("inputBook");
  submitBook.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();

    title.value = "";
    author.value = "";
    years.value = "";
    check.checked = false;
  });

  if (checkStorage()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const incomplete = document.getElementById("incompleteBookshelfList");
  const complete = document.getElementById("completeBookshelfList");
  incomplete.innerHTML = "";
  complete.innerHTML = "";

  for (const book of books) {
    const item = makeBook(book);
    if (!book.isCompleted) {
      incomplete.append(item);
    } else {
      complete.append(item);
    }
  }
});

// Menyimpan Data

const SAVED_EVENT = "saved-books";
const STORAGE_KEY = "MY_BOOKS";

function checkStorage() {
  if (typeof Storage === undefined) {
    alert("Browser Anda Tidak Mendukung Local Storage");
    return false;
  }
  return true;
}

function saveData() {
  if (checkStorage()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data != null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

// Cari Buku

const searchButton = document.getElementById("searchSubmit");
const searchBook = document.getElementById("searchBookTitle");

function foundBook() {
  const booksArr = [];

  for (const book of books) {
    const wordTitle = book.title.toLowerCase().split(" ");
    const word = searchBook.value.toLowerCase().split(" ");

    const found = wordTitle.some((bookFound) => word.includes(bookFound));

    if (found == true) {
      booksArr.push(book);
    }
  }

  return booksArr;
}

searchButton.addEventListener("click", function (event) {
  event.preventDefault();
  const found = foundBook();

  const incomplete = document.getElementById("incompleteBookshelfList");
  const complete = document.getElementById("completeBookshelfList");
  incomplete.innerHTML = "";
  complete.innerHTML = "";

  if (found.length != 0) {
    for (const book of found) {
      const item = makeBook(book);

      if (book.isCompleted == true) {
        complete.append(item);
      } else {
        incomplete.append(item);
      }
    }
  } else if (searchBook.value == "") {
    window.location.reload();
  } else {
    alert("Maaf, Buku Yang Anda Cari Tidak Ditemukan");
  }
});
