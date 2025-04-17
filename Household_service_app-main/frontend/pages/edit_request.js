export default {
  template: `
    <div class="container mt-5">
    <br>
        <h1 class="text-center mb-4">Edit Service Request</h1>
        <div class="card">
            <div class="card-body mb-3">
                <div class="form-group">
                    <label for="service_name">Service Name</label>
                    <input type="text" class="form-control" id="service_name" v-model="serviceRequest.service_name" disabled>
                </div>
                <br>
                <div class="form-group mb-3">
                    <label for="offered_price">Offered Price</label>
                    <input type="number" class="form-control" id="offered_price" v-model="serviceRequest.offered_price" @input="validateOfferedPrice">
                    <small v-if="offeredPriceError" class="text-danger">{{ offeredPriceError }}</small>
                </div>
                <br>
                <button class="btn btn-warning" @click="updateRequest">Update Request</button>
                <button class="btn btn-secondary" @click="cancel">Cancel</button>
            </div>
        </div>
    </div>
  `,
  data() {
    return {
      serviceRequest: {
        request_id: null,
        service_name: '',
        offered_price: 0,
        base_price: 0,
      },
      offeredPriceError: ''
    };
  },
  methods: {
    validateOfferedPrice() {
      const minPrice = this.serviceRequest.base_price - 100;
      const maxPrice = this.serviceRequest.base_price + 100;
      if (!this.serviceRequest.offered_price || isNaN(this.serviceRequest.offered_price) || this.serviceRequest.offered_price <= 0) {
        this.offeredPriceError = "Offered price must be a positive number.";
      } else if (this.serviceRequest.offered_price < minPrice || this.serviceRequest.offered_price > maxPrice) {
        this.offeredPriceError = `Offered price must be between ${minPrice} and ${maxPrice}.`;
      } else {
        this.offeredPriceError = "";
      }
    },
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
          request_id: data.request_id,
          service_name: data.service_name,
          offered_price: data.offered_price,
          base_price: data.base_price,
        };
      } else {
        const responseData = await response.json();
        console.error("Failed to fetch service request", responseData.message);
        alert(responseData.message || "Failed to fetch service request");
      }
    },
    async updateRequest() {
      this.validateOfferedPrice();

      if (!this.serviceRequest.service_name || !this.serviceRequest.offered_price) {
        alert("Please fill all fields.");
        return;
    }

      if (this.offeredPriceError) {
        alert("Please fix the errors before submitting.");
        return;
      }

      const request_id = this.serviceRequest.request_id;
      const headers = {
        "Content-Type": "application/json",
        "Authentication-Token": this.$store.state.auth_token,
      };

      const response = await fetch(location.origin + `/api/service_request/${request_id}`, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify({
          offered_price: this.serviceRequest.offered_price,
        }),
      });

      if (response.ok) {
        alert("Service request updated successfully");
        this.$router.push("/customer_dashboard");
      } else {
        const responseData = await response.json();
        console.error("Failed to update service request", responseData.message);
        alert(responseData.message || "Failed to update service request");
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