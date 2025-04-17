export default {
    template: `
    <div class="container mt-5">
        <br>    
        <h1 class="text-center mb-4">Book Service</h1>
        <div class="border p-4 rounded">
        <div class="mb-3">
            <label for="service_name" class="form-label">Service Name</label>
            <input type="text" class="form-control" id="service_name" v-model="service.service_name" disabled>
        </div>
        <div class="mb-3">
            <label for="offered_price" class="form-label">Offered Price</label>
            <input type="number" class="form-control" id="offered_price" v-model="offered_price" @input="validateOfferedPrice" :min="minPrice" :max="maxPrice">
            <small v-if="offeredPriceError" class="text-danger">{{ offeredPriceError }}</small>
            <small class="form-text text-muted">Offer a price within a range of 100 from the base price.</small>
        </div>
        <button @click="bookService" class="btn btn-primary">Book</button>
        <button class="btn btn"><router-link to="/customer_dashboard" class="btn btn-secondary">Back</router-link></button>
        </div>
    </div>
    `,
    data() {
        return {
            service: {},
            offered_price: 0,
            minPrice: 0,
            maxPrice: 0,
            offeredPriceError: ''
        }
    },
    methods: {
        validateOfferedPrice() {
            if (!this.offered_price || isNaN(this.offered_price) || this.offered_price <= 0) {
                this.offeredPriceError = "Offered price must be a positive number.";
            } else {
                this.offeredPriceError = "";
            }
        },
        async fetchService() {
            const headers = {
                'Content-Type': 'application/json',
                'Authentication-Token': this.$store.state.auth_token
            };

            const response = await fetch(location.origin + `/api/service/${this.$route.params.service_id}`, {
                method: 'GET',
                headers: headers
            });

            if (response.ok) {
                this.service = await response.json();
                this.offered_price = this.service.base_price;
                this.minPrice = this.service.base_price - 100;
                this.maxPrice = this.service.base_price + 100;
            } else {
                const responseData = await response.json();
                console.error("Failed to fetch service", responseData.message);
                alert(responseData.message || 'Failed to fetch service');
            }
        },
        async bookService() {
            this.validateOfferedPrice();

            if (!this.service.service_name || !this.offered_price) {
                alert("Please fill all fields.");
                return;
            }

            if (this.offeredPriceError) {
                alert("Please fix the errors before submitting.");
                return;
            }

            if (this.offered_price < this.minPrice || this.offered_price > this.maxPrice) {
                alert(`Please offer a price within the range of ${this.minPrice} and ${this.maxPrice}`);
                return;
            }

            const headers = {
                'Content-Type': 'application/json',
                'Authentication-Token': this.$store.state.auth_token
            };

            const response = await fetch(location.origin + '/api/service_request', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    service_id: this.service.service_id,
                    customer_email: JSON.parse(localStorage.getItem('user')).email,
                    
                    offered_price: this.offered_price,
                    status: 'pending'
                })
            });

            if (response.ok) {
                alert('Service booked successfully');
                this.$router.push("/customer_dashboard");
            } else {
                const responseData = await response.json();
                console.error("Failed to book service", responseData.message);
                alert(responseData.message || 'Failed to book service');
            }
        }
    },
    mounted() {
        this.fetchService();
    }
}