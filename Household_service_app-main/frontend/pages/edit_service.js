export default {
    template: `
    <div class="container mt-5">
    <br>
        <h1 class="text-center mb-4">Edit Service</h1>
        <div class="card">
            <div class="card-body">
                <div class="mb-3">
                    <label for="service_name" class="form-label">Service Name</label>
                    <input type="text" class="form-control" id="service_name" v-model="service_name" @input="validateServiceName">
                    <small v-if="serviceNameError" class="text-danger">{{ serviceNameError }}</small>
                </div>
                <div class="mb-3">
                    <label for="base_price" class="form-label">Base Price</label>
                    <input type="number" class="form-control" id="base_price" v-model="base_price" @input="validateBasePrice">
                    <small v-if="basePriceError" class="text-danger">{{ basePriceError }}</small>
                </div>
                <button class="btn btn-primary" @click="updateService">Update Service</button>
                <button class="btn btn"><router-link to="/admin_dashboard" class="btn btn-secondary">Cancel</router-link></button>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            service_name: '',
            base_price: '',
            serviceNameError: '',
            basePriceError: ''
        }
    },
    methods: {
        validateServiceName() {
            if (!this.service_name) {
                this.serviceNameError = "Service name is required.";
            } else {
                this.serviceNameError = "";
            }
        },
        validateBasePrice() {
            if (!this.base_price || isNaN(this.base_price) || this.base_price <= 0) {
                this.basePriceError = "Base price must be a positive number.";
            } else {
                this.basePriceError = "";
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
                const service = await response.json();
                this.service_name = service.service_name;
                this.base_price = service.base_price;
            } else {
                const responseData = await response.json();
                console.error("Failed to fetch service", responseData.message);
                alert(responseData.message || 'Failed to fetch service');
            }
        },
        async updateService() {
            this.validateServiceName();
            this.validateBasePrice();

            if (!this.service_name || !this.base_price) {
                alert("Please fill all fields.");
                return;
            }

            if (this.serviceNameError || this.basePriceError) {
                alert("Please fix the correct data before submitting.");
                return;
            }

            const headers = {
                'Content-Type': 'application/json',
                'Authentication-Token': this.$store.state.auth_token
            };

            const response = await fetch(location.origin + `/api/service/${this.$route.params.service_id}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify({
                    service_name: this.service_name,
                    base_price: this.base_price
                })
            });

            const responseData = await response.json();
            if (response.ok) {
                alert('Service updated successfully');
                this.$router.push("/admin_dashboard");
            } else {
                console.error("Failed to update service", responseData.message);
                alert(responseData.message || 'Failed to update service');
            }
        }
    },
    mounted() {
        this.fetchService();
    }
}