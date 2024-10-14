# SHOP API DOCS
[Base URL](https://test.shop.chiwa.id/)
## ENV Variabel
```
PORT=3006
JWT_SECRET=""
DB_PASSWORD=""
JWT_EXPIRATION=3600
```
## Endpoint

### 1. Autentikasi
#### Register
- **POST** `/auth/register`
- **Body:** `{ "username": "string", "password": "string" }`
- **Response:** `201 Created` jika sukses.

#### Login
- **POST** `/auth/login`
- **Body:** `{ "username": "string", "password": "string" }`
- **Response:** `200 OK` dengan token JWT.

#### Authentication Method
- Header Authorization: ```token```

### 2. Produk
#### Tambah Produk
- **POST** `/products` (autentikasi dibutuhkan)
- **Body:** `{ "name": "string", "price": "number", "category_id": "number" }`
- **Response:** `201 Created` jika sukses.

#### Update Produk
- **PUT** `/products/:id` (autentikasi dibutuhkan)
- **Body:** `{ "name": "string", "price": "number", "category_id": "number" }`
- **Response:** `200 OK` jika sukses.

#### Hapus Produk
- **DELETE** `/products/:id` (autentikasi dibutuhkan)
- **Response:** `200 OK` jika sukses.

#### Daftar Produk
- **GET** `/products` (autentikasi dibutuhkan)
- **Query:** `category_id` (opsional)
- **Response:** `200 OK` dengan daftar produk.

### 3. Kategori
#### Tambah Kategori
- **POST** `/categories` (autentikasi dibutuhkan)
- **Body:** `{ "name": "string" }`
- **Response:** `201 Created` jika sukses.

#### Update Kategori
- **PUT** `/categories/:id` (autentikasi dibutuhkan)
- **Body:** `{ "name": "string" }`
- **Response:** `200 OK` jika sukses.

#### Daftar Kategori
- **GET** `/categories` (autentikasi dibutuhkan)
- **Response:** `200 OK` dengan daftar kategori.

### 4. Pesanan
#### Tambah Pesanan
- **POST** `/orders` (autentikasi dibutuhkan)
- **Body:** `{ "products": [{ "product_id": "number", "quantity": "number" }] }`
- **Response:** `201 Created` jika sukses.

#### Daftar Pesanan
- **GET** `/orders` (autentikasi dibutuhkan)
- **Response:** `200 OK` dengan daftar pesanan.

## Kesalahan Umum
- `401 Unauthorized`: Token tidak valid.
- `500 Internal Server Error`: Kesalahan server.
