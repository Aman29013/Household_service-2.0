export default {
    template: ` 
    <div class="container d-flex flex-column align-items-center vh-100 pt-5" style="margin-top:50px;">
        
        <div class="card shadow-lg p-4" style="width: 100%; max-width: 700px;">
            <h1 class="text-center mb-4">Search User Here:</h1>

           
            <div class="mb-3">
                <label for="role" class="form-label">Role:</label>
                <select id="role" class="form-select" v-model="role">
                    <option disabled value="">Select Role</option>
                    <option value="customer">Customer</option>
                    <option value="professional">Professional</option>
                </select>
            </div>

            
            <div v-if="role">
                <div class="mb-3">
                    <label for="field" class="form-label">Search using:</label>
                    <select id="field" class="form-select" v-model="field">
                        <option disabled value="">Select Field</option>
                        <option value="email">Email</option>
                        <option value="name">Name</option>
                    </select>
                </div>
            </div>

           
            <div v-if="field">
                <div class="mb-3 d-flex">
                    <input type="text" id="search" v-model="searchQuery" class="form-control" placeholder="Enter search value" />
                    <button class="btn btn-outline-success ms-2" @click="search">Search</button>
                </div>
                <small v-if="emailError" class="text-danger">{{ emailError }}</small>
            </div>
        </div> 
        
        
        <div v-if="results.length" class="mt-4 w-100">
            <h4 class="text-center">Results:</h4>

            
            <div v-if="role==='customer'" class="card p-3 mt-3">
                <h5 class="text-center">Customers</h5>
                <div class="table-responsive">
                    <table class="table table-striped text-center">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Email</th>
                                <th>Name</th>
                                <th>Address</th>
                                <th>Pincode</th>
                                <th>Phone</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="customer in results" :key="customer.cust_id">
                                <td>{{ customer.cust_id }}</td>
                                <td>{{ customer.cust_email }}</td>
                                <td>{{ customer.cust_name }}</td>
                                <td>{{ customer.cust_address }}</td>
                                <td>{{ customer.cust_pincode }}</td>
                                <td>{{ customer.cust_phone }}</td>
                                <td>
                                    <button 
                                        v-if="customer.cust_active"
                                        class="btn btn-danger btn-sm"
                                        @click="toggleCustomerStatus(customer)">
                                        Block
                                    </button>
                                    <button 
                                        v-if="!customer.cust_active"
                                        class="btn btn-success btn-sm"
                                        @click="toggleCustomerStatus(customer)">
                                        Unblock
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            
            <div v-if="role==='professional'" class="card p-3 mt-3">
                <h5 class="text-center">Professionals</h5>
                <div class="table-responsive">
                    <table class="table table-striped text-center">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Email</th>
                                <th>Name</th>
                                <th>Address</th>
                                <th>Pincode</th>
                                <th>Service</th>
                                <th>Experience</th>
                                <th>Phone</th>
                                <th>Rating</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="professional in results" :key="professional.prof_id">
                                <td>{{ professional.prof_id }}</td>
                                <td>{{ professional.prof_email }}</td>
                                <td>{{ professional.prof_name }}</td>
                                <td>{{ professional.prof_address }}</td>
                                <td>{{ professional.prof_pincode }}</td>
                                <td>{{ professional.prof_service_name }}</td>
                                <td>{{ professional.prof_experience }}</td>
                                <td>{{ professional.prof_phone }}</td>
                                <td>{{ formatRating(professional.prof_rating )}}</td>
                                <td v-if="professional.prof_verified">
                                    <button 
                                        v-if="professional.prof_active"
                                        class="btn btn-danger btn-sm"
                                        @click="toggleProfessionalStatus(professional)">
                                        Block
                                    </button>
                                    <button 
                                        v-if="!professional.prof_active"
                                        class="btn btn-success btn-sm"
                                        @click="toggleProfessionalStatus(professional)">
                                        Unblock
                                    </button>
                                
                                </td>
                                <td v-else-if="!professional.prof_verified">
                                <button @click="acceptProfessional(professional.prof_id)" class="btn btn-success btn-sm">Accept</button>
                                <button @click="deleteProfessional(professional.prof_id)" class="btn btn-danger btn-sm">Delete</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
         
         <div v-else-if="searched &&  !results.length" class="alert alert-warning text-center mt-3">
    No results found!.
</div>

    </div> 
    
    `,

    data() {
        return {
            role: "",
            field: "",
            searchQuery: "",
            emailError: "",
            results: [],
            searched:false,
        };
    },

    methods: {
        validateEmail() {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(this.searchQuery)) {
                this.emailError = "Please enter a valid email.";
            } else {
                this.emailError = "";
            }
        },
        async search() {
            if (!this.role || !this.field || !this.searchQuery.trim()) {
                alert("Please select and fill all fields.");
                return;
            }
            if (this.field === "email") {
                this.validateEmail();
                if (this.emailError) {
                    alert("Please fix the email before submitting.");
                    return;
                }
            }
        
            try {
                const search = await fetch(location.origin + "/search_user", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": this.$store.state.auth_token,
                    },
                    body: JSON.stringify({
                        role: this.role,
                        field: this.field,
                        query: this.searchQuery,
                    }),
                });

                const data = await search.json();
                console.log("API Response:", data);

                if (search.ok) {
                    this.results = Array.isArray(data) ? data : [];
                    // this.searched=true;
                } else {
                    this.results = [];
                    // alert(`Failed: ${data.message}`);
                }
            } catch (error) {
                console.error("Search request failed:", error);
                alert("An error occurred while searching.");
                this.results = [];
            }
            finally {
                this.searched = true; 
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
                await this.search();
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
                await this.search();
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
                body: JSON.stringify({ active: !professional.prof_active }),
              });
              if (response.ok) {
                professional.prof_active = !professional.prof_active;
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
                body: JSON.stringify({ active: !customer.cust_active }),
              });
              if (response.ok) {
                customer.cust_active = !customer.cust_active;
              } else {
                console.error("Failed to toggle status", await response.text());
              }
            } catch (error) {
              console.error("Error:", error);
            }
          },
          formatRating(rating) {
            return rating ? rating.toFixed(1) : "Not Rated";
          },
    }
};
