export default {
    template: `
    <div>
        <nav class="navbar navbar-expand-lg navbar-light fixed-top" style="background-color:rgb(212, 241, 248);">
            <div class="container-fluid">
                <router-link to='/' class="navbar-brand">Household-Service App</router-link>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                    <router-link v-if="!$store.state.loggedIn" to='/' class="nav-link">Home</router-link>
                </li>
                        <li class="nav-item">
                            <router-link v-if="!$store.state.loggedIn" to='/login' class="nav-link">Login</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link v-if="!$store.state.loggedIn" to='/register' class="nav-link">Register</router-link>
                        </li>

                        <li class="nav-item">
                        <router-link v-if="$store.state.loggedIn && $store.state.role=='admin'" to="/admin_dashboard" class="nav-link">Dashboard</router-link>
                        </li>

                        <li class="nav-item">
                        <router-link v-if="$store.state.loggedIn && $store.state.role=='admin'" to="/admin_search" class="nav-link">Search</router-link>
                        </li>

                        <li class="nav-item">
                        <router-link v-if="$store.state.loggedIn && $store.state.role=='customer'" to="/customer_dashboard" class="nav-link">Dashboard</router-link>
                        </li>

                        <li class="nav-item">
                        <router-link v-if="$store.state.loggedIn && $store.state.role=='customer'" to="/customer_search" class="nav-link">Search</router-link>
                        </li>

                        <li class="nav-item">
                        <router-link v-if="$store.state.loggedIn && $store.state.role=='professional'" to="/professional_dashboard" class="nav-link">Dashboard</router-link>
                        </li>

                        

                        <li class="nav-item">
                        <a id="logout" v-if="$store.state.loggedIn" @click="$store.commit('logout');$router.push('/login');" class="nav-link">Logout</a>

                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </div>
    `
}