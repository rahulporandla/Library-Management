//importing express package
const express = require("express");

//creating app instance
const app = express();

//for parsing application/json
app.use(express.json());

//Book class
class Book {
  constructor(title, author, ISBN) {
    if (!title || !author || !ISBN) {
      throw new Error("Title, author, ISBN are required for creating a book.");
    }

    (this.title = title), (this.author = author), (this.ISBN = ISBN);
  }

  displayInfo() {
    console.log(
      `Title: ${this.title}, Author: ${this.author}, ISBN: ${this.ISBN}`
    );
  }
}

//EBook subClass
class EBook extends Book {
  constructor(title, author, ISBN, fileFormat) {
    super(title, author, ISBN);
    this.fileFormat = fileFormat;
  }

  displayInfo() {
    super.displayInfo();
    console.log(`File Format: ${this.fileFormat}`);
  }
}

//Library class
class Library {
  constructor() {
    this.books = [];
  }

  addBook(book) {
    if (!(book instanceof Book)) {
      throw new Error("Invalid book object. Must be an instance of Book.");
    }

    this.books.push(book);
  }

  displayBooks() {
    if (this.books.length === 0) {
      console.log("No books available in the library.");
      return;
    }
    this.books.forEach((book) => book.displayInfo());
  }

  searchByTitle(title) {
    if (!title) {
      throw new Error("Title is required for searching books.");
    }
    const foundBooks = this.books.filter((book) => book.title.includes(title));

    if (foundBooks.length === 0) {
      throw new Error(`No books found with title containing '${title}'.`);
    }
    return foundBooks;
  }

  deleteBook(ISBN) {
    if (!ISBN) {
      throw new Error("ISBN is required for deleting a book.");
    }

    const index = this.books.findIndex((book) => book.ISBN === ISBN);

    if (index !== -1) {
      this.books.splice(index, 1);
      console.log(`Book with ISBN ${ISBN} deleted successfully.`);
    } else {
      throw new Error(`Book with ISBN ${ISBN} not found.`);
    }
  }
}

//test the book and library classes
try {
  //instances of Book class
  const book1 = new Book("The Great Gatsby", "F. Scott Fitzgerald", "123456");
  const book2 = new Book("To Kill a Mockingbird", "Harper Lee", "789012");

  //instance of library class
  const library = new Library();

  //testing addBook method of library
  library.addBook(book1);
  library.addBook(book2);

  //testing displayBooks method of library
  console.log("All Books:");
  library.displayBooks();

  //testing searchByTitle method of library
  console.log('\nBooks with "Mockingbird" in the title:');
  const foundBooksArray = library.searchByTitle("Mockingbird");
  foundBooksArray.forEach((each) => each.displayInfo());

  //testing deleteBook method of library
  library.deleteBook("123456");

  //test the ebook subclass
  const ebook1 = new EBook("Harry Potter", "J.K. Rowling", "567890", "PDF");
  console.log("\t");
  ebook1.displayInfo();

  //--->API EndPoints<---//

  //add Book API
  app.post("/addBook/", (request, response) => {
    try {
      const { title, author, ISBN, fileFormat } = request.body;
      const newBook = fileFormat
        ? new EBook(title, author, ISBN, fileFormat)
        : new Book(title, author, ISBN);
      library.addBook(newBook);
      response.send("Book added successfully.");
    } catch (error) {
      response.error(error.message);
      response.status(400).send(error.message);
    }
  });

  //get Book API
  app.get("/listBooks/", (request, response) => {
    const { search_q = "" } = request.query;
    try {
      if (!search_q) {
        response.send(library.books);
        return;
      }
      const obj = library.searchByTitle(search_q);
      if (obj.length !== 0) {
        response.send(obj);
        return;
      }
    } catch (error) {
      response.status(400).send(error.message);
    }
  });

  //delete book API
  app.delete("/deleteBook/:ISBN", (request, response) => {
    try {
      const ISBN = request.params.ISBN;
      library.deleteBook(ISBN);
      response.send("Book deleted successfully.");
    } catch (error) {
      console.error(error.message);
      response.status(400).send(error.message);
    }
  });
} catch (error) {
  console.error(error.message);
}

//starting server
app.listen(3000, () => {
  console.log("\t");
  console.log("server listening to port: 3000");
});
