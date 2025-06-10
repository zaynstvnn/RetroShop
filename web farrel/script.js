// script.js

// Event listener ini memastikan kode JavaScript baru berjalan setelah seluruh halaman HTML dimuat.
document.addEventListener('DOMContentLoaded', () => {

    /**
     * Mengambil data keranjang dari localStorage.
     * localStorage adalah penyimpanan di browser.
     * JSON.parse mengubah teks JSON kembali menjadi objek/array JavaScript.
     * Jika tidak ada data 'cart', kembalikan array kosong [].
     */
    function getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    /**
     * Menyimpan data keranjang ke localStorage.
     * JSON.stringify mengubah objek/array menjadi format teks JSON untuk disimpan.
     */
    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount(); // Setiap kali menyimpan, perbarui juga angka di ikon keranjang.
    }

    /**
     * Memperbarui angka di ikon keranjang pada header.
     * .reduce() menjumlahkan semua nilai 'quantity' dari setiap item di keranjang.
     */
    function updateCartCount() {
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            const cart = getCart();
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalItems;
        }
    }

    /**
     * Fungsi utama untuk menambahkan produk ke keranjang.
     */
    function addToCart(productId) {
        const cart = getCart();
        // Temukan produk di database 'products' berdasarkan ID yang diklik.
        const product = products.find(p => p.id === productId);

        // Cek apakah produk sudah ada di keranjang.
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            // Jika sudah ada, tambah jumlahnya (quantity).
            existingItem.quantity++;
        } else {
            // Jika belum ada, tambahkan item baru ke keranjang.
            cart.push({ id: productId, nama: product.nama, harga: product.harga, gambar: product.gambar, quantity: 1 });
        }

        saveCart(cart);
        alert(`${product.nama} telah ditambahkan ke keranjang!`);
    }

    // ===================================================================
    // LOGIKA UNTUK TAMPILAN SETIAP HALAMAN
    // ===================================================================

    // 1. Logika untuk Halaman Utama (index.html)
    const productGrid = document.getElementById('product-grid');
    if (productGrid) {
        // Loop melalui setiap produk di database dan buat kartu produknya.
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            // innerHTML ini membangun struktur HTML untuk setiap kartu produk.
            card.innerHTML = `
                <a href="produk.html?id=${product.id}">
                    <img src="${product.gambar}" alt="${product.nama}">
                    <div class="product-card-content">
                        <h3>${product.nama}</h3>
                        <p class="price">Rp ${product.harga.toLocaleString('id-ID')}</p>
                    </div>
                </a>
                <button class="add-to-cart-btn">Tambah ke Keranjang</button>
            `;
            // Tambahkan event listener untuk tombol 'Tambah ke Keranjang'.
            card.querySelector('.add-to-cart-btn').addEventListener('click', () => {
                addToCart(product.id);
            });
            productGrid.appendChild(card);
        });
    }

    // 2. Logika untuk Halaman Detail Produk (produk.html)
    const productDetail = document.getElementById('product-detail');
    if (productDetail) {
        // Ambil ID produk dari URL (misal: produk.html?id=1).
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));
        const product = products.find(p => p.id === productId);

        if (product) {
            // Jika produk ditemukan, bangun struktur HTML untuk detailnya.
            productDetail.innerHTML = `
                <div class="image-gallery">
                    <img src="${product.gambar}" alt="${product.nama}">
                </div>
                <div class="info">
                    <h1>${product.nama}</h1>
                    <p class="price">Rp ${product.harga.toLocaleString('id-ID')}</p>
                    <p>${product.deskripsi}</p>
                    <button class="add-to-cart-btn">Tambah ke Keranjang</button>
                </div>
            `;
            // Tambahkan event listener untuk tombol.
            productDetail.querySelector('.add-to-cart-btn').addEventListener('click', () => {
                addToCart(product.id);
            });
        } else {
            productDetail.innerHTML = '<p>Produk tidak ditemukan.</p>';
        }
    }

// 3. Logika untuk Halaman Keranjang (keranjang.html)
    const cartContainer = document.getElementById('cart-container');
    if (cartContainer) {
        const cart = getCart();
        const checkoutFormContainer = document.getElementById('checkout-form-container');

        if (cart.length === 0) {
            cartContainer.innerHTML = '<p>Keranjang belanja Anda masih kosong. Mari jelajahi <a href="index.html">produk kami</a>!</p>';
            // Sembunyikan form jika keranjang kosong
            checkoutFormContainer.style.display = 'none'; 
        } else {
            let total = 0;
            const itemsHtml = cart.map(item => {
                const subtotal = item.harga * item.quantity;
                total += subtotal;
                // --- PERUBAHAN DI SINI: MENAMBAHKAN TOMBOL HAPUS ---
                return `
                    <div class="cart-item">
                        <img src="${item.gambar}" alt="${item.nama}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;">
                        <div class="cart-item-info">
                            <strong>${item.nama}</strong>
                            <p>Jumlah: ${item.quantity}</p>
                        </div>
                        <div class="cart-item-action">
                            <span>Rp ${subtotal.toLocaleString('id-ID')}</span>
                            <button class="delete-btn" data-id="${item.id}">Hapus</button>
                        </div>
                    </div>
                `;
            }).join('');

            cartContainer.innerHTML = `
                ${itemsHtml}
                <div class="cart-total">
                    <strong>Total Belanja: Rp ${total.toLocaleString('id-ID')}</strong>
                </div>
            `;
            
            checkoutFormContainer.style.display = 'block';

            // --- KODE BARU: LOGIKA UNTUK TOMBOL HAPUS ---
            const deleteButtons = document.querySelectorAll('.delete-btn');
            deleteButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Ambil ID produk dari atribut data-id
                    const productId = parseInt(this.dataset.id);
                    
                    // Ambil data keranjang saat ini
                    let currentCart = getCart();

                    // Buat array baru yang isinya semua produk KECUALI produk yang mau dihapus
                    currentCart = currentCart.filter(item => item.id !== productId);
                    
                    // Simpan array baru ke localStorage
                    saveCart(currentCart);

                    // Muat ulang halaman untuk menampilkan keranjang yang sudah diperbarui
                    alert('Produk telah dihapus dari keranjang.');
                    location.reload(); 
                });
            });
        }

        const customerForm = document.getElementById('customer-form');
        if (customerForm) {
            customerForm.addEventListener('submit', function(event) {
                event.preventDefault(); 
                const nomorWhatsApp = '6281322998301';
                const nama = document.getElementById('customer-name').value;
                const alamat = document.getElementById('customer-address').value;
                let pesan = `Halo RetroShop, saya mau pesan:\n\n`;
                let totalHarga = 0;
                const cartForMessage = getCart(); // Ambil data cart terbaru
                cartForMessage.forEach(item => {
                    const subtotal = item.harga * item.quantity;
                    pesan += `*${item.nama}*\n`;
                    pesan += `Jumlah: ${item.quantity}\n`;
                    pesan += `Subtotal: Rp ${subtotal.toLocaleString('id-ID')}\n\n`;
                    totalHarga += subtotal;
                });
                pesan += `*Total Belanja: Rp ${totalHarga.toLocaleString('id-ID')}*\n\n`;
                pesan += `Berikut data saya:\n`;
                pesan += `Nama: ${nama}\n`;
                pesan += `Alamat: ${alamat}\n\n`;
                pesan += `Mohon segera diproses. Terima kasih!`;
                const pesanEncoded = encodeURIComponent(pesan);
                const linkWhatsApp = `https://wa.me/${nomorWhatsApp}?text=${pesanEncoded}`;
                window.open(linkWhatsApp, '_blank');
            });
        }
    }

    // Panggil fungsi ini di akhir agar count di header selalu update saat halaman pertama kali dimuat.
    updateCartCount();
});
