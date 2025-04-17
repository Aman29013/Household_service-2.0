export default {
  template: `
    <div class="container mt-5">
      <br>
      <h1 class="text-center mb-4">Professional Dashboard</h1>
      <p class="text-center">Welcome, <b>{{$store.state.email}}</b></p>
      <h6 class="text-center" v-for="prof in professionals" v-if="prof.email === $store.state.email">
        Your Rating: <b>{{ formatRating(prof.rating) }}</b>
      </h6>
      <p v-if="Array.isArray(allreqs) && allreqs.length > 0">
        Fixed Price for <b>{{ allreqs[0].service_name }}</b> is <b>&#8377;{{ allreqs[0].base_price }}</b>
      </p>

      <!-- Navbar -->
      <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" href="#/professional_dashboard" @click="currentView = 'availableRequests'">Available Requests</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#/professional_dashboard" @click="currentView = 'requestStatus'">Request Status</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#/professional_dashboard" @click="currentView = 'closedRequests'">Closed Requests</a>
          </li>
        </ul>
      </nav>

      <!-- Conditional Rendering -->
      <div v-if="currentView === 'availableRequests'">
        <div class="card mb-4">
          <div class="card-body">
            <h3 class="card-title">Available Requests</h3>
            <table class="table table-striped">
              <thead class="text-center">
                <tr>
                  <th scope="col">Customer Name</th>
                  <th scope="col">Customer Email</th>
                  <th scope="col">Address</th>
                  <th scope="col">Phone No.</th>
                  <th scope="col">Offered Price</th>
                  <th scope="col">Requested Date</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody class="text-center">
                <tr v-for="request in availableRequests" :key="request.request_id" v-if="request.customer_active">
                  <td>{{ request.customer_name }}</td>
                  <td>{{ request.customer_email }}</td>
                  <td>{{ request.customer_address }},{{ request.customer_pincode }}</td>
                  <td>{{ request.customer_phone }}</td>
                  <td>{{ request.offered_price }}</td>
                  <td>{{ formatDate(request.requested_date) }}</td>
                  <td>
                    <button class="btn btn-success" @click="acceptRequest(request.request_id)">Accept</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div v-if="currentView === 'requestStatus'">
        <div class="card mb-4">
          <div class="card-body">
            <h3 class="card-title">Request Status</h3>
            <table class="table table-striped">
              <thead class="text-center">
                <tr>
                  <th scope="col">Customer Name</th>
                  <th scope="col">Customer Email</th>
                  <th scope="col">Address</th>
                  <th scope="col">Phone No.</th>
                  <th scope="col">Offered Price</th>
                  <th scope="col">Requested Date</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody class="text-center">
                <tr v-for="request in requestStatus" :key="request.request_id" v-if="request.customer_active">
                  <td>{{ request.customer_name }}</td>
                  <td>{{ request.customer_email }}</td>
                  <td>{{ request.customer_address }},{{ request.customer_pincode }}</td>
                  <td>{{ request.customer_phone }}</td>
                  <td>{{ request.offered_price }}</td>
                  <td>{{ formatDate(request.requested_date) }}</td>
                  <td>
                    <button class="btn btn-danger" @click="rejectRequest(request.request_id)">Reject</button>
                    <button class="btn btn-warning" @click="closeRequest(request.request_id)">Close</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div v-if="currentView === 'closedRequests'">
        <div class="card mb-4">
          <div class="card-body">
            <h3 class="card-title">Closed Requests</h3>
            <table class="table table-striped">
              <thead class="text-center">
                <tr>
                  <th scope="col">Request ID</th>
                  <th scope="col">Service Name</th>
                  <th scope="col">Customer Email</th>
                  <th scope="col">Offered Price</th>
                  <th scope="col">Requested Date</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody class="text-center">
                <tr v-for="request in closedRequests" :key="request.request_id">
                  <td>{{ request.request_id }}</td>
                  <td>{{ request.service_name }}</td>
                  <td>{{ request.customer_email }}</td>
                  <td>{{ request.offered_price }}</td>
                  <td>{{ formatDate(request.requested_date) }}</td>
                  <td>{{ request.status }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      currentView: 'availableRequests', // Default view
      allreqs: [],
      availableRequests: [],
      requestStatus: [],
      closedRequests: [],
      professionals: [],
    };
  },
  methods: {
    async fetchData() {
      const headers = {
        "Content-Type": "application/json",
        "Authentication-Token": this.$store.state.auth_token,
      };
      const [ProfessionalApi, ServiceRequestApi] = await Promise.all([
        fetch(location.origin + "/api/professional", { headers }),
        fetch(location.origin + "/api/service_request", { headers }),
      ]);

      if (ServiceRequestApi.ok) {
        const requests = await ServiceRequestApi.json();

        this.allreqs = requests;
        console.log(requests[0]);
        this.availableRequests = requests.filter(
          (request) => request.status === "pending"
        );
        this.requestStatus = requests.filter(
          (request) => request.status === "approved"
        );
        this.closedRequests = requests.filter(
          (request) => request.status === "closed"
        );
      } else {
        const responseData = await ServiceRequestApi.json();
        console.error("Failed to fetch requests", responseData.message);
        alert(responseData.message || "Failed to fetch requests");
      }
      let responseData;
      if (ProfessionalApi.ok) {
        this.professionals = await ProfessionalApi.json();
      } else {
        responseData = await ProfessionalApi.json();
        console.error("Failed to fetch services", responseData.message);
      }
    },
    async acceptRequest(request_id) {
      const headers = {
        "Content-Type": "application/json",
        "Authentication-Token": this.$store.state.auth_token,
      };

      const response = await fetch(
        location.origin + `/api/service_request/${request_id}`,
        {
          method: "PUT",
          headers: headers,
          body: JSON.stringify({
            status: "approved",
            professional_email: this.$store.state.email,
          }),
        }
      );

      if (response.ok) {
        this.fetchData();
      } else {
        const responseData = await response.json();
        console.error("Failed to accept service request", responseData.message);
        alert(responseData.message || "Failed to accept service request");
      }
    },

    async rejectRequest(request_id) {
      const headers = {
        "Content-Type": "application/json",
        "Authentication-Token": this.$store.state.auth_token,
      };

      const response = await fetch(
        location.origin + `/api/service_request/${request_id}`,
        {
          method: "PUT",
          headers: headers,
          body: JSON.stringify({
            status: "pending",
            professional_email: "No",
          }),
        }
      );
      if (response.ok) {
        this.fetchData();
      } else {
        const responseData = await response.json();
        console.error("Failed to accept service request", responseData.message);
        alert(responseData.message || "Failed to accept service request");
      }
    },
    async closeRequest(request_id) {
      const headers = {
        "Content-Type": "application/json",
        "Authentication-Token": this.$store.state.auth_token,
      };

      const response = await fetch(
        location.origin + `/api/service_request/${request_id}`,
        {
          method: "PUT",
          headers: headers,
          body: JSON.stringify({
            status: "closed",
          }),
        }
      );

      if (response.ok) {
        location.reload();
      } else {
        const responseData = await response.json();
        console.error("Failed to close service request", responseData.message);
        alert(responseData.message || "Failed to close service request");
      }
    },

    formatDate(date) {
      const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      };
      return new Date(date).toLocaleString("en-GB", options);
    },
    formatRating(rating) {
      return rating ? rating.toFixed(1) : "Not Rated";
    }
  },
  mounted() {
    this.fetchData();
  },
};
