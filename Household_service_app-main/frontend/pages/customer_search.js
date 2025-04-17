export default {
    template: `
    <div class="container  d-flex flex-column align-items-center vh-100 pt-5" style="margin-top:50px;">
    <br><br>
        <div class="card shadow-lg p-4" style="width: 100%; max-width: 700px;">
        
            <h1 class="text-center mb-4">Search for Service</h1>

            
            <div class="mb-3">
                <input type="text" v-model="searchQuery" class="form-control" 
                    placeholder="Enter service name, address, or pincode">
            </div>
            <div class="d-flex gap-2 w-100 ">
            <button class="btn btn-success px-3 py-2" @click="search">Search</button>
    <router-link to="/customer_dashboard" class="btn btn-secondary d-flex align-items-center justify-content-center px-3 py-2">
        Back
    </router-link>
            </div>
        </div> 

        
        <br>
        <div v-if="results.length" class="card p-3 mt-3  mx-auto" style="width: 75vw;">
    <h5 class="text-center">Available Professionals</h5>
    <div class="table-responsive">
        <table class="table table-striped text-center">
            <thead>
                <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Service</th>
                    <th>Address</th>
                    <th>Pincode</th>
                    <th>Phone</th>
                    <th>Base-Price</th>
                    <th>Rating</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="professional in results" :key="professional.prof_id" v-if="professional.status">
                    <td>{{ professional.email }}</td>
                    <td>{{ professional.name }}</td>
                    <td>{{ professional.service_name }}</td>
                    <td>{{ professional.address }}</td>
                    <td>{{ professional.pincode }}</td>
                    <td>{{ professional.phone }}</td>
                    <td>{{professional.base_price}}</td>
                    <td>{{ formatRating(professional.rating) }}</td>
                    <td>
                    <button class="btn btn-primary" @click="bookService(professional)">Book</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

        
        <div v-else-if="searched && !results.length" class="alert alert-warning text-center mt-3">
            No Service found!
        </div>
    </div> 
    `,

    data() {
        return {
            searchQuery: "",
            results: [],
            searched: false
        };
    },

    methods: {
        async search() {
            if (!this.searchQuery.trim()) {
                alert("Please enter your search word");
                return;
            }

            try {
                const response = await fetch("/search_service", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": this.$store.state.auth_token,
                    },
                    body: JSON.stringify({ search: this.searchQuery }),
                });

                const data = await response.json();
                this.results = Array.isArray(data) ? data : [];
                this.searched = true;

            } catch (error) {
                console.error("Search request failed:", error);
                alert("An error occurred while searching.");
                this.results = [];
            }
        },

        // async bookService(service_id) {
        //     this.$router.push(`/book_service/${service_id}`);
        //   },

        async bookService(professional) {
            try {
                const response = await fetch(location.origin + "/api/service_request", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": this.$store.state.auth_token
                    },
                    body: JSON.stringify({
                        service_id: professional.service_id,
                        professional_email: professional.email, 
                        customer_email: this.$store.state.email,  
                        offered_price: professional.base_price,  
                        status: 'pending'
                    })
                });
        
                const data = await response.json();
        
                if (response.ok) {
                    alert("Service request successfully created!");
                    this.$router.push("/customer_dashboard"); 
                } else {
                    alert(`Error: ${data.message}`);
                }
            } catch (error) {
                console.error("Booking error:", error);
                alert("Something went wrong. Please try again.");
            }
        },
        
        
        formatRating(rating) {
            return rating ? rating.toFixed(1) : "Not Rated";
          }
    }
};
