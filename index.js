var products = []
var elmHidden = document.getElementById('loading')
handleLoading(false)
var total = 0
var sizeSelected = []
var cartSelected = []
function fetchData() {
  handleLoading(true)
  fetch('https://react-shopping-cart-67954.firebaseio.com/products.json')
    .then(function (response) {
      return response.json()
    })
    .then(function (data) {
      products = sizeSelected.length ? data.products.filter(product => sizeSelected.find(size => product.availableSizes.includes(size))) : data.products
      dataProcessing()
      total = products.length
      grossTotal()
      handleLoading(false)
    })
    .catch(function () {
      alert("Có lỗi khi tải dữ liệu. Vui lòng thử lại sau")
    })
}
fetchData()
function grossTotal() {
  var b = `<label class="label">${total} Product(s) found</label>`
  var showGrossTotal = document.getElementById('gross_total')
  showGrossTotal.innerHTML = b
}
function dataProcessing() {
  var a = ''
  products.forEach(row => {
    var className = row.installments == 0 ? "hidden" : "below"
    var freeShipping = row.isFreeShipping == false ? "hidden" : "free_shipping"
    var price = row.price
    var medium = Math.round((price / row.installments) * 100) / 100
    var string = String(medium)
    var array = string.split('.')
    if (array[1] < 10) {
      array[1] += '0'
    } else if (!array[1]) {
      array[1] = '00'
    }
    var str = String(price)
    var arr = str.split('.')
    if (arr[1] < 10) {
      arr[1] += '0'
    } else if (!arr[1]) {
      arr[1] = '00'
    }
    a += `<div class="product-item">
    <div class="banner">
      <div class="${freeShipping}">Free shipping</div>
      <img src="https://react-shopping-cart-67954.firebaseapp.com/static/media/9197907543445676-1-cart.06382e6e916ca43f0304.webp" />
    </div>
    <div class="title">
      <p>${row.title}</p>
      <div class="border"></div>
    </div>
    <div class="money">
      <div class="above">
        <div class="first">${row.currencyFormat}</div>
        <h3>${arr[0]}</h3>
        <label>.${arr[1]}</label>
      </div>
      <div class="${className}">
        <label>or ${row.installments} x</label>
        <h4>${row.currencyFormat}${array[0]}.${array[1]}</h4>
      </div>
    </div>
    <button type="submit" onclick="addProductToCart(${row.id})">Add to cart</button>
    </div>`
  });
  var elmId = document.getElementById('items')
  elmId.innerHTML = a
}
function handleLoading(hide) {
  !hide ? elmHidden.classList.add('hidden') : elmHidden.classList.remove('hidden')
}
const productSizes = document.getElementsByClassName("size-item");
for (let index = 0; index < productSizes.length; index++) {
  const element = productSizes[index];
  element.addEventListener("click", function () {
    const dataSize = this.dataset.size
    if (sizeSelected.includes(dataSize) == false) {
      sizeSelected.push(dataSize)
      this.classList.add('selected')
      fetchData()
    } else {
      sizeSelected = sizeSelected.filter(size => size != dataSize)
      this.classList.remove('selected')
      fetchData()
    }
  });
}
function toggleCart() {
  document.getElementById('cart').classList.toggle('open')
}
function addProductToCart(id) {
  if (cartSelected.find(cart => cart.id == id)) {
    cartSelected = cartSelected.map(product => product.id == id ? { ...product, quantity: product.quantity + 1 } : product)
  } else {
    var p = products.find(product => product.id == id)
    p.quantity = 1;
    cartSelected.push(p)
  }
  showProduct()
  totalPrice()
  return
}
function showProduct() {
  var productInCart = ''
  if (cartSelected.length) {
    cartSelected.forEach(row => {
      var disabled = row.quantity == 1 ? 'disabled' : ''
      var price = row.price
      var str = String(price)
      var arr = str.split('.')
      if (arr[1] < 10) {
        arr[1] += '0'
      } else if (!arr[1]) {
        arr[1] = '00'
      }
      productInCart += `<div class="item">
      <img src="https://react-shopping-cart-67954.firebaseapp.com/static/media/9197907543445676-1-cart.06382e6e916ca43f0304.webp" />
      <div class="detail">
        <label class="letter">${row.title}</label>
        <div class="between">
          <label>${row.availableSizes[0]}</label>
          <label>|</label>
          <label>${row.style}</label>
        </div>
          <label>Quantity: ${row.quantity}</label>
      </div>
      <div class="price">
        <i class="fa fa-times" onclick="removeProduct(${row.id})" aria-hidden="true"></i>
        <label>${row.currencyFormat}${arr[0]}.${arr[1]}</label>
        <div class="addition">
          <button type="button" class="minus" ${disabled} onclick=" minusProductQuantity(${row.id})">-</button>
          <button type="button" class="minus" onclick="addProductQuantity(${row.id})">+</button>
        </div>
      </div>
      </div>`
    });
  } else {
    productInCart += `<p>Add some products in the cart<br>:)</p>`
  }
  var elmCartBody = document.getElementsByClassName('cart-body')[0]
  elmCartBody.innerHTML = productInCart
}
function removeProduct(id) {
  cartSelected = cartSelected.filter(product => product.id != id)
  showProduct()
  totalPrice()
}
function addProductQuantity(id) {
  cartSelected = cartSelected.map(product => product.id == id ? { ...product, quantity: product.quantity + 1 } : product)
  showProduct()
  totalPrice()
}
function minusProductQuantity(id) {
  cartSelected = cartSelected.map(product => product.id == id ? { ...product, quantity: product.quantity - 1 } : product)
  showProduct()
  totalPrice()
}
const elmInstallment = document.getElementById('or-total')
const totalElm = document.getElementById('total')
function totalPrice() {
  if (cartSelected.length) {
    const total = cartSelected.reduce((a, b) => a + b.price * b.quantity, 0)
    const str = String(Math.round(total * 100) / 100)
    const arr = str.split('.')
    arr[1] && arr[1].length == 1 && arr[1] < 10 ? arr[1] += '0' : (!arr[1] ? arr[1] = '00' : 1)
    const maxInstallments = Math.max(...cartSelected.map(o => o.installments))
    const unitPrice = Math.round((total / maxInstallments) * 100) / 100
    totalElm.innerHTML = "$ " + arr[0] + '.' + arr[1]
    elmInstallment.innerHTML = `OR UP TO ${maxInstallments} x $ ${unitPrice}`
  } else {
    totalElm.innerHTML = "$ 0.00"
    elmInstallment.innerHTML = ""
  }
  const elmQuantities = document.getElementsByClassName('quantity')
  const totalQty = cartSelected.reduce((a, b) => a + b.quantity, 0)
  for (let i = 0; i < elmQuantities.length; i++) {
    elmQuantities[i].innerHTML = totalQty
  }
}
function submitProduct() {
  const total = cartSelected.reduce((a, b) => a + b.price * b.quantity, 0)
  const str = String(Math.round(total * 100) / 100)
  const arr = str.split('.')
  arr[1] && arr[1].length == 1 && arr[1] < 10 ? arr[1] += '0' : (!arr[1] ? arr[1] = '00' : 1)
  cartSelected.length ? alert('Checkout - Subtotal: ' + "$ " + arr[0] + '.' + arr[1]) : alert('Add some product in the cart!')
}