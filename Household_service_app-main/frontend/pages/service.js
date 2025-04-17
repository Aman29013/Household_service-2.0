export default {
    template: `
    <div class="container mt-5">
    <br>
        <h1 class="text-center mb-4">Add Service</h1>
        <div class="card">
            <div class="card-body">
                <div class="mb-3">
                    <label for="service_name" class="form-label">Service Name</label>
                    <input type="text" class="form-control" id="service_name" v-model="service_name">
                </div>
                <div class="mb-3">
                    <label for="base_price" class="form-label">Base Price</label>
                    <input type="number" class="form-control" id="base_price" v-model="base_price" @input="validateBasePrice">
                    <small v-if="priceError" class="text-danger">{{ priceError }}</small>
                </div>
                <button class="btn btn-primary" @click="addService">Add Service</button>
                <button class="btn btn"><router-link to="/admin_dashboard" class="btn btn-secondary">Cancel</router-link></button>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            service_name: '',
            base_price: '',
            priceError: '',
        }
    },
    methods: {
        validateBasePrice() {
            if (!this.base_price || this.base_price <= 0) {
                this.priceError = "Base price must be a positive number.";
            } else {
                this.priceError = "";
            }
        },
        async addService() {

            this.validateBasePrice();

         
            if (!this.service_name || !this.base_price) {
                alert("Please fill all fields.");
                return;
            }

            
            if (this.priceError) {
                alert("Please fix the base-price before submitting.");
                return;
            }

            const headers = {
                'Content-Type': 'application/json',
                'Authentication-Token': this.$store.state.auth_token
            };

            const response = await fetch(location.origin + '/api/service', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    service_name: this.service_name,
                    base_price: this.base_price
                })
            });
            const responseData = await response.json();
            if (response.ok) {
                alert('Service added successfully');
                this.service_name = '';
                this.base_price = '';
                this.$router.push("/admin_dashboard");
            } else {
                console.error("Failed to add service", responseData.message);
                alert(responseData.message || 'Failed to add service');
            }
        }
    }
}