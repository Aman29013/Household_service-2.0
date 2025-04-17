export default {
  template: `
    <div class="container mt-5">
      <br>
      <h1 class="text-center mb-4">Admin Dashboard</h1>
      <p class="text-center">Welcome, <b>{{$store.state.email}}</b></p>
      
      <!-- Navbar -->
      <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" href="#/admin_dashboard" @click="currentView = 'services'">Services</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#/admin_dashboard" @click="currentView = 'professionals'">Professionals</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#/admin_dashboard" @click="currentView = 'customers'">Customers</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#/admin_dashboard" @click="currentView = 'proposals'">Service Proposals</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#/admin_dashboard" @click="currentView = 'requests'">Requests</a>
          </li>
        </ul>
      </nav>

      <!-- Conditional Rendering -->
      <div v-if="currentView === 'services'">
        <!-- Services Table -->
        <div class="card mb-4">
          <div class="card-body">
            <h3 class="card-title">Services</h3>
            <table class="table table-striped">
              <thead class="text-center mb-4">
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Service Name</th>
                  <th scope="col">Base Price</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody class="text-center">
                <tr v-for="service in services" :key="service.service_id">
                  <td>{{ service.service_id }}</td>
                  <td>{{ service.service_name }}</td>
                  <td>{{ service.base_price }}</td>
                  <td>
                    <button @click="editService(service.service_id)" class="btn btn-warning">Edit</button>
                    <button @click="deleteService(service.service_id)" class="btn btn-danger">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <button class="btn btn-warning">
              <router-link to='/service' class="nav-link">+ Add Service</router-link>
            </button>
          </div>
        </div>
      </div>

      <div v-if="currentView === 'professionals'">
        <!-- Professionals Table -->
        <div class="card mb-4">
          <div class="card-body">
            <h3 class="card-title">Professionals</h3>
            <table class="table table-striped">
              <thead class="text-center">
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Email</th>
                  <th scope="col">Name</th>
                  <th scope="col">Address</th>
                  <th scope="col">Pincode</th>
                  <th scope="col">Service Name</th>
                  <th scope="col">Experience</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Rating</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody class="text-center">
                <tr v-for="professional in professionals" :key="professional.prof_id">
                  <td>{{ professional.prof_id }}</td>
                  <td>{{ professional.email }}</td>
                  <td>{{ professional.name }}</td>
                  <td>{{ professional.address }}</td>
                  <td>{{ professional.pincode }}</td>
                  <td>{{ professional.service_name }}</td>
                  <td>{{ professional.experience }}</td>
                  <td>{{ professional.phone }}</td>
                  <td>{{ formatRating(professional.rating) }}</td>
                  <td>
                    <button 
                      v-if="professional.active"
                      class="btn btn-danger"
                      @click="toggleProfessionalStatus(professional)">
                      Block
                    </button>
                    <button 
                      v-if="!professional.active"
                      class="btn btn-success"
                      @click="toggleProfessionalStatus(professional)">
                      Unblock
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card mb-4" v-if="currentView === 'proposals'">
            <div class="card-body">
                <h3 class="card-title">Service Proposals</h3>
                <table class="table table-striped">
                    <thead class="text-center">
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Email</th>
                            <th scope="col">Name</th>
                            <th scope="col">Address</th>
                            <th scope="col">Pincode</th>
                            <th scope="col">Service Name</th>
                            <th scope="col">Experience</th>
                            <th scope="col">Phone</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody class="text-center">
                        <tr v-for="proposal in unverifiedProfessionals" :key="proposal.prof_id">
                            <td>{{ proposal.prof_id }}</td>
                            <td>{{ proposal.email }}</td>
                            <td>{{ proposal.name }}</td>
                            <td>{{ proposal.address }}</td>
                            <td>{{ proposal.pincode }}</td>
                            <td>{{ proposal.service_name }}</td>
                            <td>{{ proposal.experience }}</td>
                            <td>{{ proposal.phone }}</td>
                            <td>
                                <button @click="acceptProfessional(proposal.prof_id)" class="btn btn-success ">Accept</button>
                                <button @click="deleteProfessional(proposal.prof_id)" class="btn btn-danger ">Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

      <div v-if="currentView === 'customers'">
        <!-- Customers Table -->
        <div class="card mb-4">
          <div class="card-body">
            <h3 class="card-title">Customers</h3>
            <table class="table table-striped">
              <thead class="text-center">
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Email</th>
                  <th scope="col">Name</th>
                  <th scope="col">Address</th>
                  <th scope="col">Pincode</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody class="text-center">
                <tr v-for="customer in customers" :key="customer.cust_id">
                  <td>{{ customer.cust_id }}</td>
                  <td>{{ customer.email }}</td>
                  <td>{{ customer.name }}</td>
                  <td>{{ customer.address }}</td>
                  <td>{{ customer.pincode }}</td>
                  <td>{{ customer.phone }}</td>
                  <td>
                    <button 
                      v-if="customer.active"
                      class="btn btn-danger"
                      @click="toggleCustomerStatus(customer)">
                      Block
                    </button>
                    <button 
                      v-if="!customer.active"
                      class="btn btn-success"
                      @click="toggleCustomerStatus(customer)">
                      Unblock
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <br>
     
      <div v-if="currentView === 'requests'">
      <button @click="create_csv" class="btn btn-success "style="margin-bottom:5px;">Get Closed Request Details</button>
        <div class="card mb-4">
          <div class="card-body">
            <h3 class="card-title">Service Requests</h3>
            <table class="table table-striped">
              <thead class="text-center">
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Customer Email</th>
                  <th scope="col">Offered Price</th>
                  <th scope="col">Professional Email</th>
                  <th scope="col">Service Name</th>
                  <th scope="col">Requested Date</th>
                  <th scope="col">Closed Date</th>
                  <th scope="col">Rating</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody class="text-center">
                <tr v-for="serviceRequest in serviceRequests" :key="serviceRequest.request_id">
                  <td>{{ serviceRequest.request_id }}</td>
                  <td>{{ serviceRequest.customer_email }}</td>
                  <td>{{ serviceRequest.offered_price }}</td>
                  <td>{{ serviceRequest.professional_email }}</td>
                  <td>{{ serviceRequest.service_name }}</td>
                  <td>{{ formatDate(serviceRequest.requested_date) }}</td>
                  <td>{{ formatDate(serviceRequest.closed_date) }}</td>
                  <td v-if="serviceRequest.rating > 0">{{ serviceRequest.rating }}</td>
                  <td v-else>Not Rated</td>
                  <td>{{ serviceRequest.status }}</td>
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
      customers: [],
      professionals: [],
      unverifiedProfessionals: [],
      services: [],
      serviceRequests: [],
    };
  },
  methods: {
    async fetchData() {
      const headers = {
        "Content-Type": "application/json",
        "Authentication-Token": this.$store.state.auth_token,
      };

      const [CustomerApi, ProfessionalApi, ServiceApi, ServiceRequestApi] =
        await Promise.all([
          fetch(location.origin + "/api/customer", { headers }),
          fetch(location.origin + "/api/professional", { headers }),
          fetch(location.origin + "/api/service", { headers }),
          fetch(location.origin + "/api/service_request", { headers }),
        ]);

      if (CustomerApi.ok) {
        this.customers = await CustomerApi.json();
      } else {
        console.error("Failed to fetch customers", await CustomerApi.text());
      }

      if (ProfessionalApi.ok) {
        const professionals = await ProfessionalApi.json();
        this.professionals = professionals.filter((prof) => prof.verified);
        this.unverifiedProfessionals = professionals.filter(
          (prof) => !prof.verified
        );
      } else {
        console.error(
          "Failed to fetch professionals",
          await ProfessionalApi.text()
        );
      }

      if (ServiceApi.ok) {
        this.services = await ServiceApi.json();
      } else {
        console.error("Failed to fetch services", await ServiceApi.text());
      }

      if (ServiceRequestApi.ok) {
        this.serviceRequests = await ServiceRequestApi.json();
      } else {
        console.error(
          "Failed to fetch service requests",
          await ServiceRequestApi.text()
        );
      }
    },
    async acceptProfessional(prof_id) {
      const headers = {
        "Content-Type": "application/json",
        "Authentication-Token": this.$store.state.auth_token,
      };

      const response = await fetch(
        location.origin + `/api/professional/${prof_id}`,
        {
          method: "PUT",
          headers: headers,
          body: JSON.stringify({ verified: true, active: true }),
        }
      );

      if (response.ok) {
        this.fetchData();
      } else {
        console.error("Failed to accept professional", await response.text());
      }
    },
    async deleteProfessional(prof_id) {
      const headers = {
        "Content-Type": "application/json",
        "Authentication-Token": this.$store.state.auth_token,
      };

      const response = await fetch(
        location.origin + `/api/professional/${prof_id}`,
        {
          method: "DELETE",
          headers: headers,
        }
      );

      if (response.ok) {
        this.fetchData();
      } else {
        console.error("Failed to delete professional", await response.text());
      }
    },
    async toggleProfessionalStatus(professional) {
      const headers = {
        "Content-Type": "application/json",
        "Authentication-Token": this.$store.state.auth_token,
      };

      try {
        const response = await fetch(`/api/professional/${professional.prof_id}`, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify({ active: !professional.active }),
        });
        if (response.ok) {
          professional.active = !professional.active;
        } else {
          console.error("Failed to toggle status", await response.text());
        }
      } catch (error) {
        console.error("Error:", error);
      }
    },
    async toggleCustomerStatus(customer) {
      const headers = {
        "Content-Type": "application/json",
        "Authentication-Token": this.$store.state.auth_token,
      };

      try {
        const response = await fetch(`/api/customer/${customer.cust_id}`, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify({ active: !customer.active }),
        });
        if (response.ok) {
          customer.active = !customer.active;
        } else {
          console.error("Failed to toggle status", await response.text());
        }
      } catch (error) {
        console.error("Error:", error);
      }
    },
    async deleteService(service_id) {
      const headers = {
        "Content-Type": "application/json",
        "Authentication-Token": this.$store.state.auth_token,
      };

      const response = await fetch(location.origin + `/api/service/${service_id}`, {
        method: 'DELETE',
        headers: headers,
      });

      if (response.ok) {
        this.fetchData();
      } else {
        console.error("Failed to delete service", await response.text());
      }
    },
    async editService(service_id) {
      this.$router.push(`/edit_service/${service_id}`);
    },
    async create_csv(){
      const headers = {
        "Content-Type": "application/json",
        "Authentication-Token": this.$store.state.auth_token,
      };
      const response=await fetch(location.origin + `/create_csv`,{method: 'GET',
        headers: headers,});
      
        if(response.ok){
          const task_id=(await response.json()).task_id

          const interval=setInterval(async()=>{
          const get_res=await fetch(location.origin + `/get_csv/${task_id}`,{method: 'GET',
            headers: headers,});
            if(get_res.ok){
              console.log('information is ready')
              window.open(location.origin + `/get_csv/${task_id}`);
              clearInterval(interval);
              
              alert("Information is downloading")
         
            }
        },100)
        
         }


    },
    formatDate(date) {
      if(date){
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      return new Date(date).toLocaleString('en-GB', options);
      }
      else{
        return "Not Closed"
      }
    },
    formatRating(rating) {
      return rating ? rating.toFixed(1) : "Not Rated";
    }
  },
  mounted() {
    this.fetchData();
  },
};
