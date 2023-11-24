


document.addEventListener('DOMContentLoaded', () =>  {

const productList = document.getElementById('product-list');
  
    fetch('/products')
      .then(response => response.json())
      .then(products => {
        products.forEach(product => {
          const productCard = document.createElement('div');
          productCard.classList.add('product-card');
  
          productCard.innerHTML = `
            <img src="${product.imagePath}" alt="${product.name}" class="product-image">
            <div class="product-details">
              <h3 class="product-name">${product.name}</h3>
              <p class="product-price">$${product.price.toFixed(2)}</p>
              <p class="product-category">${product.category}</p>
            </div>
          `;
  
          productList.appendChild(productCard);
        });
      })
      .catch(error => console.error('Error fetching products:', error));
  });




   