const Hapi = require("@hapi/hapi");
const { nanoid } = require("nanoid");

// Data penyimpanan sementara (in-memory)
const books = [];

// Inisialisasi server
const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: "localhost",
  });

  // Route untuk menyimpan buku (Kriteria 3)
  server.route({
    method: "POST",
    path: "/books",
    handler: (request, h) => {
      const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
      } = request.payload;

      // Validasi: Nama wajib ada
      if (!name) {
        return h
          .response({
            status: "fail",
            message: "Gagal menambahkan buku. Mohon isi nama buku",
          })
          .code(400);
      }

      // Validasi: readPage tidak boleh lebih besar dari pageCount
      if (readPage > pageCount) {
        return h
          .response({
            status: "fail",
            message:
              "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
          })
          .code(400);
      }

      // Buat objek buku baru
      const id = nanoid();
      const finished = pageCount === readPage;
      const insertedAt = new Date().toISOString();
      const updatedAt = insertedAt;

      const newBook = {
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        insertedAt,
        updatedAt,
      };

      books.push(newBook);

      return h
        .response({
          status: "success",
          message: "Buku berhasil ditambahkan",
          data: {
            bookId: id,
          },
        })
        .code(201);
    },
  });

  // Route untuk menampilkan semua buku (Kriteria 4)
  server.route({
    method: "GET",
    path: "/books",
    handler: () => ({
      status: "success",
      data: {
        books: books.map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        })),
      },
    }),
  });

  // Route untuk menampilkan detail buku (Kriteria 5)
  server.route({
    method: "GET",
    path: "/books/{bookId}",
    handler: (request) => {
      const { bookId } = request.params;
      const book = books.find((b) => b.id === bookId);

      if (!book) {
        return {
          status: "fail",
          message: "Buku tidak ditemukan",
        };
      }

      return {
        status: "success",
        data: {
          book,
        },
      };
    },
  });

  // Route untuk mengubah data buku (Kriteria 6)
  server.route({
    method: "PUT",
    path: "/books/{bookId}",
    handler: (request, h) => {
      const { bookId } = request.params;
      const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
      } = request.payload;
      const index = books.findIndex((book) => book.id === bookId);

      // Validasi: Buku tidak ditemukan
      if (index === -1) {
        return h
          .response({
            status: "fail",
            message: "Gagal memperbarui buku. Id tidak ditemukan",
          })
          .code(404);
      }

      // Validasi: Nama wajib ada
      if (!name) {
        return h
          .response({
            status: "fail",
            message: "Gagal memperbarui buku. Mohon isi nama buku",
          })
          .code(400);
      }

      // Validasi: readPage tidak boleh lebih besar dari pageCount
      if (readPage > pageCount) {
        return h
          .response({
            status: "fail",
            message:
              "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
          })
          .code(400);
      }

      // Update buku
      const finished = pageCount === readPage;
      const updatedAt = new Date().toISOString();

      books[index] = {
        ...books[index],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        updatedAt,
      };

      return h
        .response({
          status: "success",
          message: "Buku berhasil diperbarui",
        })
        .code(200);
    },
  });

  // Route untuk menghapus buku (Kriteria 7)
  server.route({
    method: "DELETE",
    path: "/books/{bookId}",
    handler: (request, h) => {
      const { bookId } = request.params;
      const index = books.findIndex((book) => book.id === bookId);

      if (index === -1) {
        return h
          .response({
            status: "fail",
            message: "Buku gagal dihapus. Id tidak ditemukan",
          })
          .code(404);
      }

      books.splice(index, 1);

      return h
        .response({
          status: "success",
          message: "Buku berhasil dihapus",
        })
        .code(200);
    },
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
