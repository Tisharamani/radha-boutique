/* =====================================================
   RADHA BOUTIQUE - MAIN JAVASCRIPT
===================================================== */

console.log("Radha Boutique loaded successfully");


/* =====================================================
   MOBILE MENU
===================================================== */

function toggleMenu() {

    const menu = document.getElementById("mobileMenu");
    const button = document.querySelector(".menu-toggle");

    if (!menu) return;

    const isOpen = menu.classList.toggle("open");

    if (button) {
        button.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );
    }
}


/* Close mobile menu when clicking outside */

document.addEventListener("click", function (event) {

    const menu = document.getElementById("mobileMenu");
    const button = document.querySelector(".menu-toggle");

    if (!menu) return;

    if (
        menu.classList.contains("open") &&
        !menu.contains(event.target) &&
        !button?.contains(event.target)
    ) {

        menu.classList.remove("open");

        if (button) {
            button.setAttribute("aria-expanded", "false");
        }
    }

});


/* =====================================================
   PRODUCTS HELPER
===================================================== */

function getProducts() {

    if (typeof products !== "undefined") {
        return products;
    }

    return [];
}


/* =====================================================
   CART
===================================================== */

function getCart() {

    try {

        return JSON.parse(
            localStorage.getItem("cart")
        ) || [];

    } catch (error) {

        return [];

    }

}


/* Update cart number */

function updateCartCount() {

    const cart = getCart();

    document
        .querySelectorAll("#cartCount")
        .forEach(function (element) {

            element.textContent = cart.length;

        });

}


/* =====================================================
   PRODUCT CARD
===================================================== */

function createProductCard(product) {

    const sizes =
        Array.isArray(product.sizes)
            ? product.sizes
            : ["M"];


    return `

        <article class="product-card">

            <a
                href="product.html?id=${product.id}"
                class="product-image-link"
            >

                <div class="product-image-wrapper">

                    <img
                        src="${product.image}"
                        alt="${product.name}"
                        loading="lazy"
                    >

                </div>

            </a>


            <div class="product-info">

                <h3>
                    ${product.name}
                </h3>


                <p>
                    ${product.category || ""}
                </p>


                <p class="price">

                    ${
                        product.oldPrice
                            ? `
                                <span class="old-price">
                                    ₹${product.oldPrice}
                                </span>
                              `
                            : ""
                    }

                    <span class="new-price">
                        ₹${product.price}
                    </span>

                </p>


                <label for="size-${product.id}">
                    Select Size
                </label>


                <select
                    class="size-select"
                    id="size-${product.id}"
                >

                    ${sizes.map(function (size) {

                        return `
                            <option value="${size}">
                                ${size}
                            </option>
                        `;

                    }).join("")}

                </select>


                <button
                    class="cart-btn"
                    type="button"
                    onclick="addToCart(${product.id})"
                >
                    Add to Cart
                </button>


                <button
                    class="wishlist-btn"
                    type="button"
                    onclick="addToWishlist(${product.id})"
                >
                    ❤️ Add to Wishlist
                </button>


                <a
                    href="product.html?id=${product.id}"
                    class="details-link"
                >

                    <button
                        class="details-btn"
                        type="button"
                    >
                        View Details
                    </button>

                </a>


                <a
                    href="https://wa.me/918355907193"
                    target="_blank"
                    rel="noopener"
                >

                    <button
                        class="whatsapp-btn"
                        type="button"
                    >
                        Order on WhatsApp
                    </button>

                </a>

            </div>

        </article>

    `;

}


/* =====================================================
   DISPLAY PRODUCTS
===================================================== */

function displayProducts(list) {

    const container =
        document.getElementById("productContainer");

    if (!container) return;

    if (!Array.isArray(list)) {
        list = getProducts();
    }


    if (list.length === 0) {

        container.innerHTML = `

            <div class="empty-message">

                <h3>
                    No products found
                </h3>

                <p>
                    Please try another category or search.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        list
            .map(createProductCard)
            .join("");

}


/* =====================================================
   HOME PAGE PRODUCTS
===================================================== */

function displayHomeProducts() {

    const container =
        document.getElementById(
            "homeProductContainer"
        );

    if (!container) return;


    const allProducts = getProducts();


    /* Show first 3 products */

    const homeProducts =
        allProducts.slice(0, 3);


    container.innerHTML =
        homeProducts
            .map(createProductCard)
            .join("");

}


/* =====================================================
   SEARCH
===================================================== */

function searchProducts() {

    const input =
        document.getElementById("searchInput");

    if (!input) return;


    const searchText =
        input.value
            .toLowerCase()
            .trim();


    const allProducts =
        getProducts();


    if (!searchText) {

        displayProducts(allProducts);

        return;

    }


    const filtered =
        allProducts.filter(function (product) {

            const text = `

                ${product.name}

                ${product.category || ""}

                ${product.description || ""}

            `.toLowerCase();


            return text.includes(searchText);

        });


    displayProducts(filtered);

}


/* =====================================================
   FILTER PRODUCTS
===================================================== */

function filterProducts(category) {

    const allProducts =
        getProducts();


    if (
        !category ||
        category.toLowerCase() === "all"
    ) {

        displayProducts(allProducts);

        return;

    }


    const filtered =
        allProducts.filter(function (product) {

            return (
                product.category &&
                product.category.toLowerCase()
                    === category.toLowerCase()
            );

        });


    displayProducts(filtered);

}


/* =====================================================
   SORT PRODUCTS
===================================================== */

function sortProducts(type) {

    const allProducts =
        getProducts();


    const sorted =
        [...allProducts];


    if (type === "low") {

        sorted.sort(function (a, b) {

            return a.price - b.price;

        });

    }


    if (type === "high") {

        sorted.sort(function (a, b) {

            return b.price - a.price;

        });

    }


    if (type === "name") {

        sorted.sort(function (a, b) {

            return a.name.localeCompare(b.name);

        });

    }


    displayProducts(sorted);

}


/* =====================================================
   ADD TO CART
===================================================== */

function addToCart(id, directSize) {

    const allProducts =
        getProducts();


    const product =
        allProducts.find(function (item) {

            return item.id === id;

        });


    if (!product) {

        alert("Product not found.");

        return;

    }


    const select =
        document.getElementById(
            `size-${id}`
        );


    const size =
        directSize ||
        select?.value ||
        product.sizes?.[0] ||
        "M";


    const cart =
        getCart();


    cart.push({

        id: product.id,

        size: size,

        quantity: 1

    });


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    updateCartCount();


    alert(
        `${product.name} added to cart successfully!`
    );

}


/* =====================================================
   PRODUCT DETAILS PAGE
===================================================== */

function initProductDetails() {

    /* Only run on product.html */

    const mainImage =
        document.getElementById("mainImage");

    const productName =
        document.getElementById("productName");


    if (!mainImage || !productName) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const productId =
        params.get("id");


    const allProducts =
        getProducts();


    const product =
        allProducts.find(function (p) {

            return String(p.id) ===
                   String(productId);

        });


    if (!product) {

        document.body.innerHTML = `

            <div style="
                text-align:center;
                padding:100px 20px;
                font-family:Arial,sans-serif;
            ">

                <h2>
                    Product Not Found
                </h2>

                <p>
                    Sorry, this product is not available.
                </p>

                <a href="shop.html">
                    Back to Shop
                </a>

            </div>

        `;

        return;
    }


    /* ===============================
       PRODUCT INFORMATION
    =============================== */

    const category =
        document.getElementById(
            "productCategory"
        );


    const oldPrice =
        document.getElementById(
            "productOldPrice"
        );


    const price =
        document.getElementById(
            "productPrice"
        );


    const description =
        document.getElementById(
            "productDescription"
        );


    if (category) {

        category.textContent =
            product.category || "";

    }


    productName.textContent =
        product.name;


    if (price) {

        price.textContent =
            `₹${product.price}`;

    }


    if (description) {

        description.textContent =
            product.description ||
            "Beautiful collection from Radha Boutique.";

    }


    /* Old price */

    if (oldPrice) {

        if (product.oldPrice) {

            oldPrice.textContent =
                `₹${product.oldPrice}`;

            oldPrice.style.display =
                "inline";

        } else {

            oldPrice.style.display =
                "none";

        }

    }


    /* ===============================
       PRODUCT IMAGES
    =============================== */

    const thumbnails =
        document.getElementById(
            "productThumbnails"
        );


  let productImages = [];

if (Array.isArray(product.images) && product.images.length > 0) {
    productImages = [...product.images];
} else if (product.image) {
    productImages = [product.image];
}

/* Remove duplicate image paths */
productImages = [...new Set(productImages)];
    mainImage.src =
        productImages[0];


    mainImage.alt =
        product.name;

if (thumbnails) {

    if (productImages.length <= 1) {

        thumbnails.innerHTML = "";

    } else {

        thumbnails.innerHTML =
            productImages.map(
                function (image, index) {

                    return `
                        <button
                            type="button"
                            class="thumbnail-btn ${
                                index === 0 ? "active" : ""
                            }"
                            onclick="changeProductImage(
                                '${image}',
                                this
                            )"
                        >
                            <img
                                src="${image}"
                                alt="${product.name}"
                            >
                        </button>
                    `;

                }
            ).join("");
    }
}


    /* ===============================
       SIZES
    =============================== */

    const sizeOptions =
        document.getElementById(
            "sizeOptions"
        );


    const sizes =
        Array.isArray(product.sizes) &&
        product.sizes.length > 0
            ? product.sizes
            : ["M"];


    if (sizeOptions) {

        sizeOptions.innerHTML =
            sizes.map(
                function (size, index) {

                    return `

                        <button
                            type="button"
                            class="size-option ${
                                index === 0
                                    ? "selected"
                                    : ""
                            }"
                            onclick="
                                selectProductSize(
                                    '${size}',
                                    this
                                )
                            "
                        >
                            ${size}
                        </button>

                    `;

                }
            ).join("");

    }


    /* ===============================
       COLORS
    =============================== */

    const colorSection =
        document.getElementById(
            "colorSection"
        );


    const colorOptions =
        document.getElementById(
            "colorOptions"
        );


    if (
        product.colors &&
        typeof product.colors === "object"
    ) {

        if (colorSection) {

            colorSection.style.display =
                "block";

        }


        const colors =
            Object.keys(
                product.colors
            );


        if (colorOptions) {

            colorOptions.innerHTML =
                colors.map(
                    function (color, index) {

                        return `

                            <button
                                type="button"
                                class="color-option ${
                                    index === 0
                                        ? "selected"
                                        : ""
                                }"
                                onclick="
                                    selectProductColor(
                                        '${color}',
                                        this,
                                        '${product.colors[color]}'
                                    )
                                "
                            >
                                ${color}
                            </button>

                        `;

                    }
                ).join("");

        }


        window.selectedProductColor =
            colors[0];

    } else {

        if (colorSection) {

            colorSection.style.display =
                "none";

        }

    }


    /* Save current product */

    window.currentProduct =
        product;


    window.selectedProductSize =
        sizes[0];

}


/* Change main product image */

function changeProductImage(image, button) {

    const mainImage =
        document.getElementById(
            "mainImage"
        );


    if (mainImage) {

        mainImage.src =
            image;

    }


    document
        .querySelectorAll(
            ".thumbnail-btn"
        )
        .forEach(function (btn) {

            btn.classList.remove(
                "active"
            );

        });


    if (button) {

        button.classList.add(
            "active"
        );

    }

}


/* Select size */

function selectProductSize(
    size,
    button
) {

    window.selectedProductSize =
        size;


    document
        .querySelectorAll(
            ".size-option"
        )
        .forEach(function (btn) {

            btn.classList.remove(
                "selected"
            );

        });


    if (button) {

        button.classList.add(
            "selected"
        );

    }

}


/* Select color */

function selectProductColor(
    color,
    button,
    image
) {

    window.selectedProductColor =
        color;


    document
        .querySelectorAll(
            ".color-option"
        )
        .forEach(function (btn) {

            btn.classList.remove(
                "selected"
            );

        });


    if (button) {

        button.classList.add(
            "selected"
        );

    }


    if (image) {

        const mainImage =
            document.getElementById(
                "mainImage"
            );


        if (mainImage) {

            mainImage.src =
                image;

        }

    }

}


/* =====================================================
   CART DISPLAY
===================================================== */
function displayCart() {

    const cartContainer = document.getElementById("cartItems");
    const totalElement = document.getElementById("totalPrice");

    if (!cartContainer) return;

    const cart = getCart();
    const productsList = getProducts();

    if (cart.length === 0) {

        cartContainer.innerHTML = `
            <div class="empty-cart">
                <h3>Your cart is empty</h3>
                <p>Add something beautiful from our collection.</p>

                <a href="shop.html" class="primary-btn">
                    Continue Shopping
                </a>
            </div>
        `;

        if (totalElement) {
            totalElement.textContent = "₹0";
        }

        updateCartCount();
        return;
    }


    let total = 0;


    cartContainer.innerHTML = cart.map(function(item, index) {

        const product = productsList.find(function(p) {

            return String(p.id) === String(item.id);

        });


        if (!product) return "";


        const quantity =
            Number(item.quantity) || 1;


        const price =
            Number(product.price) || 0;


        const itemTotal =
            price * quantity;


        total += itemTotal;


        return `

            <div class="cart-item">

                <img
                    src="${product.image}"
                    alt="${product.name}">


                <div class="cart-item-info">

                    <h3>
                        ${product.name}
                    </h3>

                    <p>
                        ${product.category}
                    </p>

                    <p>
                        Size: ${item.size || "M"}
                    </p>

                    <strong>
                        ₹${price.toLocaleString("en-IN")}
                    </strong>

                </div>


                <div class="cart-item-actions">

                    <div class="quantity-control">

                        <button
                            type="button"
                            onclick="decreaseQuantity(${index})">

                            −

                        </button>


                        <span>
                            ${quantity}
                        </span>


                        <button
                            type="button"
                            onclick="increaseQuantity(${index})">

                            +

                        </button>

                    </div>


                    <strong class="cart-item-total">

                        ₹${itemTotal.toLocaleString("en-IN")}

                    </strong>


                    <button
                        type="button"
                        class="remove-btn"
                        onclick="removeFromCart(${index})">

                        Remove

                    </button>

                </div>

            </div>

        `;

    }).join("");


    if (totalElement) {

        totalElement.textContent =
            "₹" + total.toLocaleString("en-IN");

    }


    updateCartCount();

}


/* =========================================
   INCREASE QUANTITY
========================================= */

function increaseQuantity(index) {

    const cart = getCart();


    if (!cart[index]) {

        return;

    }


    cart[index].quantity =
        (Number(cart[index].quantity) || 1) + 1;


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    displayCart();


    updateCartCount();

}


/* =========================================
   DECREASE QUANTITY
========================================= */

function decreaseQuantity(index) {

    const cart = getCart();


    if (!cart[index]) {

        return;

    }


    const quantity =
        Number(cart[index].quantity) || 1;


    if (quantity > 1) {

        cart[index].quantity =
            quantity - 1;

    } else {

        cart.splice(index, 1);

    }


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    displayCart();


    updateCartCount();

}


/* =========================================
   REMOVE ITEM
========================================= */

function removeFromCart(index) {

    const cart = getCart();


    if (!cart[index]) {

        return;

    }


    cart.splice(index, 1);


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    displayCart();


    updateCartCount();

}
/* =====================================================
   WISHLIST
===================================================== */

function getWishlist() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "wishlist"
            )
        ) || [];

    } catch (error) {

        return [];

    }

}


/* Add product to wishlist */

function addToWishlist(id) {

    let wishlist =
        getWishlist();


    if (wishlist.includes(id)) {

        alert(
            "This product is already in your wishlist ❤️"
        );

        return;

    }


    wishlist.push(id);


    localStorage.setItem(
        "wishlist",
        JSON.stringify(wishlist)
    );


    alert(
        "Added to wishlist ❤️"
    );


    displayWishlist();

}


/* Remove product from wishlist */

function removeFromWishlist(id) {

    let wishlist =
        getWishlist();


    wishlist =
        wishlist.filter(
            function (productId) {

                return productId !== id;

            }
        );


    localStorage.setItem(
        "wishlist",
        JSON.stringify(wishlist)
    );


    displayWishlist();

}


/* Display wishlist */

function displayWishlist() {

    const container =
        document.getElementById(
            "wishlistItems"
        );


    if (!container) return;


    const wishlist =
        getWishlist();


    const allProducts =
        getProducts();


    if (wishlist.length === 0) {

        container.innerHTML = `

            <div class="empty-cart">

                <h2>
                    Your Wishlist is Empty ❤️
                </h2>

                <p>
                    Save your favourite outfits here.
                </p>

                <a
                    href="shop.html"
                    class="btn btn-primary"
                >
                    Explore Collection
                </a>

            </div>

        `;

        return;

    }


    const wishlistProducts =
        allProducts.filter(
            function (product) {

                return wishlist.includes(
                    product.id
                );

            }
        );


    container.innerHTML =
        wishlistProducts
            .map(
                function (product) {

                    return `

                        <article class="product-card">

                            <a
                                href="product.html?id=${product.id}"
                                class="product-image-link"
                            >

                                <div class="product-image-wrapper">

                                    <img
                                        src="${product.image}"
                                        alt="${product.name}"
                                        loading="lazy"
                                    >

                                </div>

                            </a>


                            <div class="product-info">

                                <h3>
                                    ${product.name}
                                </h3>


                                <p>
                                    ${product.category || ""}
                                </p>


                                <p class="price">

                                    ${
                                        product.oldPrice
                                            ? `
                                                <span class="old-price">
                                                    ₹${product.oldPrice}
                                                </span>
                                              `
                                            : ""
                                    }

                                    <span class="new-price">
                                        ₹${product.price}
                                    </span>

                                </p>


                                <a
                                    href="product.html?id=${product.id}"
                                    class="details-btn"
                                >
                                    View Details
                                </a>


                                <button
                                    class="cart-btn"
                                    type="button"
                                    onclick="addToCart(${product.id})"
                                >
                                    Add to Cart
                                </button>


                                <button
                                    class="remove-cart-btn"
                                    type="button"
                                    onclick="
                                        removeFromWishlist(
                                            ${product.id}
                                        )
                                    "
                                >
                                    Remove ❤️
                                </button>

                            </div>

                        </article>

                    `;

                }
            )
            .join("");

}


/* =====================================================
   CHECKOUT ORDER SUMMARY
===================================================== */

function displayCheckout() {

    const checkoutItems =
        document.getElementById(
            "checkoutItems"
        );


    const checkoutTotal =
        document.getElementById(
            "checkoutTotal"
        );


    if (
        !checkoutItems ||
        !checkoutTotal
    ) {
        return;
    }


    const cart =
        getCart();


    if (cart.length === 0) {

        checkoutItems.innerHTML = `

            <div class="empty-cart">

                <h3>
                    Your cart is empty
                </h3>

                <p>
                    Add some products before checkout.
                </p>

                <a
                    href="shop.html"
                    class="continue-shopping"
                >
                    Continue Shopping
                </a>

            </div>

        `;


        checkoutTotal.textContent =
            "₹0";

        return;

    }


    let total = 0;


    checkoutItems.innerHTML =
        cart.map(
            function (item) {

                const product =
                    getProducts().find(
                        function (p) {

                            return p.id ===
                                item.id;

                        }
                    );


                if (!product) {
                    return "";
                }


                const quantity =
                    item.quantity || 1;


                const itemTotal =
                    Number(product.price) *
                    quantity;


                total += itemTotal;


                return `

                    <div class="checkout-item">

                        <img
                            src="${product.image}"
                            alt="${product.name}"
                            class="checkout-item-image"
                        >


                        <div class="checkout-item-info">

                            <h4>
                                ${product.name}
                            </h4>


                            <p>
                                Size:
                                ${item.size || "Not selected"}
                            </p>


                            <p>
                                Quantity:
                                ${quantity}
                            </p>


                            <strong>
                                ₹${itemTotal}
                            </strong>

                        </div>

                    </div>

                `;

            }
        ).join("");


    checkoutTotal.textContent =
        `₹${total}`;

}


/* =====================================================
   PLACE ORDER ON WHATSAPP
===================================================== */

function placeOrder(event) {

    if (event) {
        event.preventDefault();
    }


    const name =
        document.getElementById(
            "customerName"
        )?.value.trim();


    const phone =
        document.getElementById(
            "customerPhone"
        )?.value.trim();


    const address =
        document.getElementById(
            "customerAddress"
        )?.value.trim();


    const city =
        document.getElementById(
            "customerCity"
        )?.value.trim();


    const pincode =
        document.getElementById(
            "customerPincode"
        )?.value.trim();


    if (
        !name ||
        !phone ||
        !address ||
        !city ||
        !pincode
    ) {

        alert(
            "Please fill in all customer details."
        );

        return;

    }


    const cart =
        getCart();


    if (cart.length === 0) {

        alert(
            "Your cart is empty!"
        );

        return;

    }


    let total = 0;


    let orderMessage =
        "Hello Radha Boutique! 👋\n\n";


    orderMessage +=
        "I would like to place an order.\n\n";


    orderMessage +=
        "CUSTOMER DETAILS\n";


    orderMessage +=
        `Name: ${name}\n`;


    orderMessage +=
        `Phone: ${phone}\n`;


    orderMessage +=
        `Address: ${address}\n`;


    orderMessage +=
        `City: ${city}\n`;


    orderMessage +=
        `Pincode: ${pincode}\n\n`;


    orderMessage +=
        "ORDER DETAILS\n";


    cart.forEach(
        function (item, index) {

            const product =
                getProducts().find(
                    function (p) {

                        return p.id ===
                            item.id;

                    }
                );


            if (!product) return;


            const quantity =
                item.quantity || 1;


            const itemTotal =
                Number(product.price) *
                quantity;


            total += itemTotal;


            orderMessage +=
                `${index + 1}. ${product.name}\n`;


            orderMessage +=
                `Size: ${item.size || "Not selected"}\n`;


            orderMessage +=
                `Quantity: ${quantity}\n`;


            orderMessage +=
                `Price: ₹${itemTotal}\n\n`;

        }
    );


    orderMessage +=
        `TOTAL: ₹${total}\n\n`;


    orderMessage +=
        "Please confirm my order. Thank you! 😊";


    const whatsappNumber =
        "918355907193";


    const whatsappURL =
        `https://wa.me/${whatsappNumber}?text=${
            encodeURIComponent(orderMessage)
        }`;


    window.open(
        whatsappURL,
        "_blank"
    );

}


/* =====================================================
   PAGE INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Initializing Radha Boutique..."
        );


        /* Cart count */

        updateCartCount();


        /* Shop page */

        if (
            document.getElementById(
                "productContainer"
            )
        ) {

            displayProducts(
                getProducts()
            );

        }


        /* Homepage */

        displayHomeProducts();


        /* Product details */

        initProductDetails();


        /* Cart page */

        displayCart();


        /* Wishlist page */

        displayWishlist();


        /* Checkout page */

        displayCheckout();

    }
);
function addProductToCart() {
    const product = window.currentProduct;

    if (!product) {
        alert("Product not found.");
        return;
    }

    const size = window.selectedProductSize || product.sizes?.[0] || "M";

    addToCart(product.id, size);
}


function orderProductOnWhatsApp() {
    const product = window.currentProduct;

    if (!product) {
        alert("Product not found.");
        return;
    }

    const size = window.selectedProductSize || product.sizes?.[0] || "M";
    const color = window.selectedProductColor || "";

    let message =
        `Hello Radha Boutique! 👋\n\n` +
        `I would like to order:\n\n` +
        `Product: ${product.name}\n` +
        `Size: ${size}\n`;

    if (color) {
        message += `Color: ${color}\n`;
    }

    message +=
        `Price: ₹${product.price}\n\n` +
        `Please confirm availability. Thank you!`;

    const whatsappURL =
        `https://wa.me/918355907193?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, "_blank");
}