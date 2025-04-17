export default {
    template: `
    <div class="container mt-5">
        <h1 class="text-center mb-4">Close Service Request</h1>
        <div class="card">
            <div class="card-body">
                <div class="mb-3">
                    <label for="service_name" class="form-label">Service Name</label>
                    <input type="text" class="form-control" id="service_name" v-model="serviceRequest.service_name" disabled>
                </div>
                <div class="mb-3">
                    <label for="rating" class="form-label">Rating</label>
                    <select id="rating" class="form-select" v-model="rating" required>
                        <option disabled value="">Select Rating</option>
                        <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
                    </select>
                </div>
                <button class="btn btn-primary" @click="closeRequest">Submit </button>
                <button class="btn btn-secondary" @click="$router.push('/customer_dashboard')">Cancel</button>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            serviceRequest: {
                professional_name: '',
                service_name:'',
                request_id: null,
            },
            rating: '',
        };
    },
    methods: {
        async fetchRequest() {
            const request_id = this.$route.params.request_id;
            const headers = {
                "Content-Type": "application/json",
                "Authentication-Token": this.$store.state.auth_token,
            };

            const response = await fetch(location.origin + `/api/service_request/${request_id}`, {
                method: "GET",
                headers: headers,
            });

            if (response.ok) {
                const data = await response.json();
                this.serviceRequest = {
                    professional_name: data.professional_name,
                    service_name:data.service_name,
                    request_id: data.request_id,
                };
            } else {
                const responseData = await response.json();
                console.error("Failed to fetch service request", responseData.message);
                alert(responseData.message || "Failed to fetch service request");
            }
        },
        async closeRequest() {
            if (!this.rating) {
                alert("Please select a rating before submitting.");
                return;
            }

            const headers = {
                "Content-Type": "application/json",
                "Authentication-Token": this.$store.state.auth_token,
            };

            const response = await fetch(location.origin + `/api/service_request/${this.serviceRequest.request_id}`, {
                method: "PUT",
                headers: headers,
                body: JSON.stringify({
                    status: "closed",
                    rating: this.rating,
                }),
            });

            if (response.ok) {
                alert("Service request closed successfully");
                this.$router.push("/customer_dashboard");
            } else {
                const responseData = await response.json();
                console.error("Failed to close service request", responseData.message);
                alert(responseData.message || "Failed to close service request");
            }
        },
        cancel() {
            this.$router.push("/customer_dashboard");
        },
    },
    mounted() {
        this.fetchRequest();
    },
};