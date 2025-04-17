export default {
  template: `
    <div class="container mt-5">
        <h1 class="text-center mb-4">Customer Dashboard</h1>
        <p class="text-center">Welcome, <b>{{$store.state.email}}</b></p>

        <!-- Navbar -->
        <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a class="nav-link" href="#/customer_dashboard" @click="currentView = 'services'">Services</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#/customer_dashboard" @click="currentView = 'pendingRequests'">Pending Requests</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#/customer_dashboard" @click="currentView = 'approvedRequests'">Approved Requests</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#/customer_dashboard" @click="currentView = 'closedRequests'">Closed Requests</a>
                </li>
            </ul>
        </nav>

        <!-- Conditional Rendering -->
        <div v-if="currentView === 'services'">
            <div class="row g-4 mb-4">
                <div class="col-md-4" v-for="service in services" :key="service.service_id">
                    <div class="card">
                        <div id="sercard" class="card-body">
                            <h5 class="card-title">{{ service.service_name }}</h5>
                            <p class="card-text">Base Price: {{ service.base_price }}</p>
                            <button class="btn btn-primary" @click="bookService(service.service_id)">Book</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="currentView === 'pendingRequests'">
            <div class="card mb-4">
                <div class="card-body">
                    <h3 class="card-title">Pending Requests</h3>
                    <table class="table table-striped">
                        <thead class="text-center">
                            <tr>
                                <th scope="col">Request ID</th>
                                <th scope="col">Service Name</th>
                                <th scope="col">Offered Price</th>
                                <th scope="col">Requested Date</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody class="text-center">
                            <tr v-for="request in pendingRequests" :key="request.request_id">
                                <td>{{ request.request_id }}</td>
                                <td>{{ request.service_name }}</td>
                                <td>{{ request.offered_price }}</td>
                                <td>{{ formatDate(request.requested_date) }}</td>
                                <td>
                                    <button class="btn btn-primary" @click="editRequest(request.request_id)">Edit</button>
                                    <button class="btn btn-danger" @click="cancelRequest(request.request_id)">Cancel</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div v-if="currentView === 'approvedRequests'">
            <div class="card mb-4">
                <div class="card-body">
                    <h3 class="card-title">Approved Requests</h3>
                    <table class="table table-striped">
                        <thead class="text-center">
                            <tr>
                                <th scope="col">Professional Name</th>
                                <th scope="col">Professional Email</th>
                                <th scope="col">Service</th>
                                <th scope="col">Experience</th>
                                <th scope="col">Address</th>
                                <th scope="col">Phone No.</th>
                                <th scope="col">Offered Price</th>
                                <th scope="col">Requested Date</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody class="text-center">
                            <tr v-for="request in approvedRequests" :key="request.request_id" v-if="request.professional_active">
                                <td>{{ request.professional_name }}</td>
                                <td>{{ request.professional_email }}</td>
                                <td>{{ request.service_name }}</td>
                                <td>{{ request.professional_exp }}</td>
                                <td>{{ request.professional_address }},{{ request.professional_pincode }}</td>
                                <td>{{ request.professional_phone }}</td>
                                <td>{{ request.offered_price }}</td>
                                <td>{{ formatDate(request.requested_date) }}</td>
                                <td>
                                <button class="btn btn-success" @click="closeRequest(request.request_id)">Close</button>
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
                                <th scope="col">Professional Name</th>
                                <th scope="col">Professional Email</th>
                                <th scope="col">Service</th>
                                <th scope="col">Address</th>
                                <th scope="col">Phone No.</th>
                                <th scope="col">Offered Price</th>
                                <th scope="col">Rating(out of 5)</th>                            
                                <th scope="col">Requested Date</th>
                                <th scope="col">Closed Date</th>
                            </tr>
                        </thead>
                        <tbody class="text-center">
                            <tr v-for="request in closedRequests" :key="request.request_id" v-if="request.professional_active">
                                <td>{{ request.professional_name }}</td>
                                <td>{{ request.professional_email }}</td>
                                <td>{{ request.service_name }}</td>
                                <td>{{ request.professional_address }},{{ request.professional_pincode }}</td>
                                <td>{{ request.professional_phone }}</td>
                                <td>{{ request.offered_price }}</td>
                                <td v-if="request.rating > 0">{{ request.rating }}</td>
                                <td v-else>Not Rated</td>
                                <td>{{ formatDate(request.requested_date) }}</td>
                                <td>{{ formatDate(request.closed_date) }}</td>
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
      currentView: 'services', // Default view
      services: [],
      approvedRequests: [],
      pendingRequests: [],
      closedRequests: [],
    };
  },
  methods: {
    async fetchData() {
      const headers = {
        "Content-Type": "application/json",
        "Authentication-Token": this.$store.state.auth_token,
      };

      const [ServiceApi, ServiceRequestApi] = await Promise.all([
        fetch(location.origin + "/api/service", { headers }),
        fetch(location.origin + "/api/service_request", { headers }),
      ]);

      let responseData;
      if (ServiceApi.ok) {
        this.services = await ServiceApi.json();
      } else {
        responseData = await ServiceApi.json();
        console.error("Failed to fetch services", responseData.message);
      }

      if (ServiceRequestApi.ok) {
        const requests = await ServiceRequestApi.json();
        console.log(requests);
        this.closedRequests = requests.filter(
          (request) => request.status === "closed"
        );
        this.pendingRequests = requests.filter(
          (request) => request.status === "pending"
        );
        this.approvedRequests = requests.filter(
          (request) => request.status === "approved"
        );
      } else {
        responseData = await ServiceRequestApi.json();
        console.error("Failed to fetch requests", responseData.message);
      }
    },
    async bookService(service_id) {
      this.$router.push(`/book_service/${service_id}`);
    },
    async editRequest(request_id) {
      this.$router.push(`/edit_request/${request_id}`);
    },
    async cancelRequest(request_id) {
      const headers = {
        "Content-Type": "application/json",
        "Authentication-Token": this.$store.state.auth_token,
      };

      const response = await fetch(location.origin + `/api/service_request/${request_id}`, {
        method: "DELETE",
        headers: headers,
      });

      if (response.ok) {
        alert("Service request canceled successfully");
        this.fetchData();
      } else {
        const responseData = await response.json();
        console.error("Failed to cancel service request", responseData.message);
        alert(responseData.message || "Failed to cancel service request");
      }
    },
    async closeRequest(request_id) {
      this.$router.push(`/close_request/${request_id}`);
    },
    formatDate(date) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      return new Date(date).toLocaleString('en-GB', options);
    }
  },
  mounted() {
    this.fetchData();
  },
};
