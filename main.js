"use strict"

Vue.createApp({
    data() {
        return {
            datos: [],
            buscando: "",
            auxBuscador: [],
            auxRadios: [],
            body: "",
            reset: "",
            valorDelRadio: "all",
            valorPrecio: "",
            productosDelCarrito: [],
            idDelProducto: [],
            productosObtenidos: [],
            idDeFavoritos: [],
            productosFavoritos: [],
            obtenerFavoritos: [],
            auxiliar: [],
            suma: 0
        }
    },

    created() {
        fetch("https://apipetshop.herokuapp.com/api/articulos")
            .then(response => response.json())
            .then(data => {
                this.datos = data.response
                this.body = document.querySelector("body")
                this.reset = document.querySelector('input[type="reset"]')

                console.log(this.datos);
                if (this.body.id == "Farmacia") {
                    this.datos = this.datos.filter(producto => producto.tipo == "Medicamento")
                } else if (this.body.id == "Juguetes") {
                    this.datos = this.datos.filter(producto => producto.tipo == "Juguete")
                }

                this.productosObtenidos = JSON.parse(localStorage.getItem("carrito"))
                if (this.productosObtenidos) {
                    this.productosDelCarrito = this.productosObtenidos
                } else {
                    this.productosObtenidos = this.productosDelCarrito
                }

                this.obtenerFavoritos = JSON.parse(localStorage.getItem("favoritos"))
                if (this.obtenerFavoritos) {
                    this.productosFavoritos = this.obtenerFavoritos
                }else {
                    this.obtenerFavoritos = this.productosFavoritos
                }

                let loader = document.querySelector(".loader")
                loader.classList.add("hidden")

                let getHTML = document.querySelector("html")
                getHTML.classList.add("overflow-shown")
            })
    },

    methods: {
        limpiarFiltros() {
            document.querySelector("form").reset()
            this.valorDelRadio = "all"
            this.valorPrecio = ""
            this.buscando = ""
        },

        llenandoCarrito(producto) {
            this.idDelProducto = this.productosDelCarrito.map(producto => producto._id)

            if (!this.idDelProducto.includes(producto._id)) {
                this.productosDelCarrito.push(producto)
                localStorage.setItem("carrito", JSON.stringify(this.productosDelCarrito))
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'bottom-start',
                    showConfirmButton: false,
                    timer: 2000,
                })

                Toast.fire({
                    icon: 'success',
                    title: 'Agregado al carrito'
                })
            } else {
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'bottom-start',
                    showConfirmButton: false,
                    timer: 2000,
                })
                
                Toast.fire({
                    icon: 'warning',
                    title: 'El producto ya está en el carrito'
                })
            }

            producto.__v = 1
        },

        vaciadoDelCarrito(producto) {
            this.productosObtenidos = this.productosObtenidos.filter(articulo => articulo._id != producto._id)
            this.productosDelCarrito = this.productosObtenidos
            localStorage.setItem("carrito", JSON.stringify(this.productosDelCarrito))
        },
        
        agregarFavoritos(producto) {
            this.idDeFavoritos = this.productosFavoritos.map(producto => producto._id)

            if (!this.idDeFavoritos.includes(producto._id)) {
                this.productosFavoritos.push(producto)
                console.log(this.productosFavoritos);
                localStorage.setItem("favoritos", JSON.stringify(this.productosFavoritos))
            }
        },

        removerDeFavoritos(producto) {
            this.obtenerFavoritos = this.obtenerFavoritos.filter(articulo => articulo._id != producto._id)
            this.productosFavoritos = this.obtenerFavoritos
            localStorage.setItem("favoritos", JSON.stringify(this.productosFavoritos))
        },


        cartelDeGracias() {
            const {
                value: text
            } = Swal.fire({
                input: 'textarea',
                inputLabel: '¡No olvides dejarnos tus comentarios!',
                inputPlaceholder: '¡Dejanos tu comentario!',
                confirmButtonText: 'Enviar',
                showDenyButton: true,
                denyButtonText: `Cancelar`,
                inputAttributes: {
                    'aria-label': 'Type your message here'
                },
            }).then((result) => {
                /* Read more about isConfirmed, isDenied below */
                if (result.isConfirmed) {
                    Swal.fire('¡Enviado!', '', 'success')
                } else if (result.isDenied) {
                    Swal.fire('Envío cancelado', '', 'error')
                }
            })

            if (text) {
                Swal.fire(text)
            }
        },

        cartelDeIndex(url) {
            Swal.fire({
                text: '',
                imageUrl: url,
                imageWidth: 500,
                imageHeight: 500,
                imageAlt: 'Custom image',
            })
        },

        comprarCarrito() {
            const swalWithBootstrapButtons = Swal.mixin({
                customClass: {
                    confirmButton: 'btn btn-success',
                    cancelButton: 'btn btn-danger'
                },
                buttonsStyling: false
            })

            swalWithBootstrapButtons.fire({
                title: '¿Realizar esta compra?',
                text: "",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Comprar',
                cancelButtonText: 'Cancelar',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    swalWithBootstrapButtons.fire(
                        'Compra realizada con exito!',
                        'Pet-shop Franco',
                        'success'
                    )
                } else if (
                    result.dismiss === Swal.DismissReason.cancel
                ) {
                    swalWithBootstrapButtons.fire(
                        'Cancelado',
                        'Su compra no ha sido realizada!',
                        'error'
                    )
                }
                if (result.isConfirmed) {
                    this.productosObtenidos = []
                    this.productosDelCarrito = this.productosObtenidos
                    localStorage.setItem("carrito", JSON.stringify(this.productosDelCarrito))
                } else if (result.dismiss) {
                    this.productosDelCarrito
                }
            })
        },

        totalFinal() {
            this.suma = 0

            for (var i in this.productosDelCarrito) {
                this.suma += this.productosDelCarrito[i].__v * this.productosDelCarrito[i].precio
            }

            return this.suma
        },

        añadir(producto) {
            var num = producto.__v++
        },

        quitar(producto) {
            var num = producto.__v--
            if (num === 1) {
                producto.__v = 1
            }
        },

    },

    computed: {
        buscarProductos() {
            this.auxBuscador = []
            this.datos.filter(producto => {

                if (producto.nombre.toUpperCase().includes(this.buscando.toUpperCase())) {
                    this.auxBuscador.push(producto)
                }
                if (producto.descripcion.toUpperCase().includes(this.buscando.toUpperCase()) && !producto.nombre.toUpperCase().includes(this.buscando.toUpperCase())) {
                    this.auxBuscador.push(producto)
                }
            })

            if (this.valorDelRadio <= 1000) {
                this.auxBuscador = this.auxBuscador.filter(producto => producto.precio <= parseInt(this.valorDelRadio) || this.valorDelRadio == "all")
            } else {
                this.auxBuscador = this.auxBuscador.filter(producto => producto.precio > parseInt(this.valorDelRadio) || this.valorDelRadio == "all")
            }

            if (this.valorPrecio == "mayor") {
                this.auxBuscador = this.auxBuscador.sort((a, b) => b.precio - a.precio)
            }

            if (this.valorPrecio == "menor") {
                this.auxBuscador = this.auxBuscador.sort((a, b) => a.precio - b.precio)
            }
        },

        iterarProductosFavoritos() {
            this.JSONauxiliar = []
            this.auxiliar = this.datos.slice(5, 9)
            return this.auxiliar
        }
    }

}).mount('#app')

AOS.init();