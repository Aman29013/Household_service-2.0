export default {
    template: ` 
    <div class="container d-flex justify-content-center align-items-center vh-100">
        <div class="card shadow-lg p-4" style="width: 100%; max-width: 400px;">
            <h1 class="text-center mb-4">Login</h1>
            <div class="mb-3">
                <label for="email" class="form-label">Email:</label>
                <input id="email" type="email" class="form-control" placeholder="Enter your email" v-model="email" @input="validateEmail"/>
                <small v-if="emailError" class="text-danger">{{ emailError }}</small>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password:</label>
                <input id="password" type="password" class="form-control" placeholder="Enter your password" v-model="password"/>
            </div>
            <button id="submit" @click="submitLogin" class="btn btn-danger  w-50">Login</button>
            <br><br>
            <router-link to="/register" class="btn btn-outline-primary">Go for Registeration</router-link>
        </div>
    </div>
    `,
    
    data() {
        return {
            email: null,
            password: null,
            emailError: '',
            services: [],
        };
    },

    methods: {
        validateEmail() {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(this.email)) {
                this.emailError = "Please enter a valid email address.";
            } else {
                this.emailError = "";
            }
        },
        async submitLogin() {
            this.validateEmail();

            if (this.emailError) {
                alert("Please fix the email before submitting.");
                return;
            }
            if (!this.password) {
                alert("Please fill  all fields.");
                return;
            }

            try {
                const res = await fetch(location.origin +'/login', { // Ensure correct API URL
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: this.email, password: this.password })
                });

                if (!res.ok) {
                    let errorMessage = "Something went wrong";
                    try {
                        const errorData = await res.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch (e) {
                        console.error("did not return JSON:", e);
                    }
                    console.error("Login failed:", errorMessage);
                    alert(errorMessage);
                    return;
                }

                const data = await res.json();
                console.log("Login successful:", data);
                localStorage.setItem('user', JSON.stringify(data)); 
                this.$store.commit('setUser');

                
                const userInfoRes = await fetch(location.origin + `/api/user`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.$store.state.auth_token
                    }
                });

                if (!userInfoRes.ok) {
                    let errorMessage = "Failed to fetch user info";
                    try {
                        const errorData = await userInfoRes.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch (e) {
                        console.error("Did not return JSON:", e);
                    }
                    console.error("Fetching user info failed:", errorMessage);
                    alert(errorMessage);
                    return;
                }

                const userInfo = await userInfoRes.json();
                console.log("User info fetched successfully:", userInfo);
                console.log("User role:", data.role);

                if (data.role === 'admin') {
                    this.$router.push('/admin_dashboard');
                } else if (data.role === 'professional' && userInfo.active === true) {
                    console.log("Professional is active");
                    this.$router.push('/professional_dashboard');
                } else if (data.role === 'customer' && userInfo.active === true) {
                    this.$router.push('/customer_dashboard');
                } else {
                    alert("User is not active");
                }

            } catch (error) {
                console.error("Network error:", error);
                alert("Network error: Could not connect to server");
            }
        },
        async fetchservice(){
            const serviceInfo = await fetch(location.origin + `/api/service`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.$store.state.auth_token,
                }
            });
            if(serviceInfo.ok){
                this.service = await serviceInfo.json();
                console.log("service fetched successfully");
            } else {
                console.error("Failed to fetch services", await serviceInfo.text());
            }
        }
    }
};
