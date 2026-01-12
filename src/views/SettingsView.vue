<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useSubscriptionStore } from '../stores/subscription'
import { useThemeStore } from '../stores/theme'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()
const themeStore = useThemeStore()
const router = useRouter()

onMounted(() => {
  subscriptionStore.loadSubscription()
})

// Profile State
const displayName = ref(authStore.user?.displayName || '')
const isUpdatingProfile = ref(false)
const profileMessage = ref('')

// Re-auth State
const showReauthModal = ref(false)
const reauthPassword = ref('')
const reauthError = ref('')
const reauthAction = ref<'password' | 'delete' | null>(null) // What to do after reauth

// Password Change State
const showNewPasswordModal = ref(false)
const newPassword = ref('')
const confirmNewPassword = ref('')
const passwordError = ref('')
const passwordSuccess = ref('')

// Delete Account State
const showDeleteConfirm = ref(false) // Final "Are you sure?" after password check

const handleUpdateProfile = async () => {
  if (!displayName.value.trim()) return
  
  isUpdatingProfile.value = true
  profileMessage.value = ''
  
  try {
    await authStore.updateDisplayName(displayName.value)
    profileMessage.value = 'Profile updated successfully.'
  } catch (e: any) {
    profileMessage.value = 'Error updating profile: ' + e.message
  } finally {
    isUpdatingProfile.value = false
  }
}

const initiateChangePassword = () => {
    reauthAction.value = 'password'
    showReauthModal.value = true
    reauthPassword.value = ''
    reauthError.value = ''
}

const initiateDeleteAccount = () => {
    reauthAction.value = 'delete'
    showReauthModal.value = true
    reauthPassword.value = ''
    reauthError.value = ''
}

const handleReauth = async () => {
    if (!reauthPassword.value) return
    reauthError.value = ''
    
    try {
        await authStore.reauthenticate(reauthPassword.value)
        showReauthModal.value = false
        
        // Proceed to next step based on action
        if (reauthAction.value === 'password') {
            showNewPasswordModal.value = true
            newPassword.value = ''
            confirmNewPassword.value = ''
            passwordError.value = ''
            passwordSuccess.value = ''
        } else if (reauthAction.value === 'delete') {
            showDeleteConfirm.value = true
        }
    } catch (e: any) {
        if (e.code === 'auth/wrong-password') {
            reauthError.value = 'Incorrect password.'
        } else {
            reauthError.value = 'Verification failed: ' + e.message
        }
    }
}

const handleChangePassword = async () => {
    if (newPassword.value.length < 6) {
        passwordError.value = 'Password must be at least 6 characters.'
        return
    }
    if (newPassword.value !== confirmNewPassword.value) {
        passwordError.value = 'Passwords do not match.'
        return
    }
    
    try {
        await authStore.updateUserPassword(newPassword.value)
        showNewPasswordModal.value = false
        alert('Password changed successfully.')
    } catch (e: any) {
        passwordError.value = e.message
    }
}

const handleDeleteAccount = async () => {
    try {
        await authStore.deleteAccount()
        router.push('/login')
    } catch (e: any) {
        alert('Failed to delete account: ' + e.message)
    }
}

// Subscription management
const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
}

const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
        'active': 'Active',
        'canceled': 'Canceled',
        'expired': 'Expired',
        'none': 'None'
    }
    return statusMap[status] || status
}

const getStatusClass = (status: string) => {
    return {
        'status-active': status === 'active',
        'status-canceled': status === 'canceled',
        'status-expired': status === 'expired'
    }
}

const handleManageSubscription = async () => {
    const customerId = subscriptionStore.subscriptionData.subscriptionCustomerId
    
    if (!customerId) {
        alert('Unable to access subscription management. Please contact support.')
        return
    }
    
    try {
        const response = await fetch('/.netlify/functions/create-portal-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ customerId })
        })
        
        const data = await response.json()
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to create portal session')
        }
        
        // Redirect to Stripe Customer Portal
        window.location.href = data.url
    } catch (error: any) {
        console.error('Portal error:', error)
        alert('Failed to open subscription management. Please try again.')
    }
</script>

<template>
  <div class="settings-view">
    <header class="page-header">
      <h2>Settings</h2>
      <p class="subtitle">Manage your account and preferences.</p>
    </header>

    <div class="settings-grid">
        <!-- Profile Section -->
        <section class="card settings-card">
            <h3>Profile</h3>
            <div class="form-group">
                <label>Email</label>
                <input type="text" :value="authStore.user?.email" disabled class="input-disabled" />
                <small>Email cannot be changed.</small>
            </div>
            <div class="form-group">
                <label>Display Name</label>
                <div class="input-row">
                    <input type="text" v-model="displayName" placeholder="Your Name" />
                    <button class="btn-primary" @click="handleUpdateProfile" :disabled="isUpdatingProfile">
                        {{ isUpdatingProfile ? 'Saving...' : 'Update' }}
                    </button>
                </div>
                <p v-if="profileMessage" class="feedback-msg" :class="{ 'error': profileMessage.includes('Error') }">{{ profileMessage }}</p>
            </div>
        </section>

        <!-- Preferences Section -->
        <section class="card settings-card">
            <h3>Preferences</h3>
            <div class="preference-item">
                <div class="pref-info">
                    <h4>Appearance</h4>
                    <p>Switch between Light and Dark mode.</p>
                </div>
                <button class="btn-toggle" @click="themeStore.toggleTheme">
                    {{ themeStore.isDark ? 'Dark Mode 🌙' : 'Light Mode ☀️' }}
                </button>
            </div>
        </section>

        <!-- Subscription Section -->
        <section class="card settings-card">
            <h3>Subscription</h3>
            <div class="preference-item">
                <div class="pref-info">
                    <h4>Current Plan</h4>
                    <p v-if="subscriptionStore.isPremium">
                        <strong>Premium</strong> - You have access to all features
                    </p>
                    <p v-else>
                        <strong>Free</strong> - Limited to 3 goals, 2 trackers, and 14-day journal editing
                    </p>
                    
                    <!-- Show subscription details for premium users -->
                    <div v-if="subscriptionStore.isPremium && subscriptionStore.subscriptionData.subscriptionId" class="subscription-details">
                        <p class="detail-item">
                            <span class="detail-label">Plan:</span>
                            <span class="detail-value plan-type">{{ subscriptionStore.subscriptionData.subscriptionPlanType || 'Premium' }}</span>
                        </p>
                        <p class="detail-item">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value" :class="getStatusClass(subscriptionStore.subscriptionData.status)">
                                {{ formatStatus(subscriptionStore.subscriptionData.status) }}
                            </span>
                        </p>
                        <p v-if="subscriptionStore.subscriptionData.subscriptionEndDate" class="detail-item">
                            <span class="detail-label">{{ subscriptionStore.subscriptionData.status === 'canceled' ? 'Access until:' : 'Renews on:' }}</span>
                            <span class="detail-value">{{ formatDate(subscriptionStore.subscriptionData.subscriptionEndDate) }}</span>
                        </p>
                    </div>
                </div>
                
                <!-- Action buttons -->
                <div class="subscription-actions">
                    <RouterLink to="/pricing" class="btn-toggle" v-if="!subscriptionStore.isPremium">
                        Upgrade to Premium
                    </RouterLink>
                    <template v-else>
                        <span class="premium-badge">✓ Premium</span>
                        <!-- Only show manage button for recurring subscriptions -->
                        <a 
                            v-if="subscriptionStore.subscriptionData.subscriptionId && subscriptionStore.subscriptionData.subscriptionEndDate"
                            href="#" 
                            class="btn-manage" 
                            @click.prevent="handleManageSubscription"
                        >
                            Manage Subscription
                        </a>
                    </template>
                </div>

            </div>
        </section>
            </div>
        </section>

        <!-- Security Section -->
        <section class="card settings-card danger-zone">
            <h3>Security</h3>
            
            <div class="security-action">
                <div class="action-info">
                    <h4>Change Password</h4>
                    <p>Update your password to keep your account secure.</p>
                </div>
                <button class="btn-secondary" @click="initiateChangePassword">Change Password</button>
            </div>

            <div class="divider"></div>

            <div class="security-action">
                <div class="action-info">
                    <h4>Delete Account</h4>
                    <p class="text-danger">Permanently delete your account and all data.</p>
                </div>
                <button class="btn-danger" @click="initiateDeleteAccount">Delete Account</button>
            </div>
        </section>
    </div>

    <!-- Modals -->
    
    <!-- Re-authentication Modal -->
    <div class="modal-overlay" v-if="showReauthModal" @click.self="showReauthModal = false">
        <div class="modal-card">
            <h3>Verify Identity</h3>
            <p>Please enter your current password to continue.</p>
            <input 
                type="password" 
                v-model="reauthPassword" 
                placeholder="Current Password" 
                @keyup.enter="handleReauth"
                autofocus
            />
            <p v-if="reauthError" class="error-msg">{{ reauthError }}</p>
            <div class="modal-actions">
                <button class="btn-text" @click="showReauthModal = false">Cancel</button>
                <button class="btn-primary" @click="handleReauth">Verify</button>
            </div>
        </div>
    </div>

    <!-- New Password Modal -->
    <div class="modal-overlay" v-if="showNewPasswordModal" @click.self="showNewPasswordModal = false">
        <div class="modal-card">
            <h3>Change Password</h3>
            <div class="form-group">
                <input type="password" v-model="newPassword" placeholder="New Password" />
            </div>
            <div class="form-group">
                <input type="password" v-model="confirmNewPassword" placeholder="Confirm New Password" />
            </div>
            <p v-if="passwordError" class="error-msg">{{ passwordError }}</p>
            <div class="modal-actions">
                <button class="btn-text" @click="showNewPasswordModal = false">Cancel</button>
                <button class="btn-primary" @click="handleChangePassword">Update Password</button>
            </div>
        </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div class="modal-overlay" v-if="showDeleteConfirm" @click.self="showDeleteConfirm = false">
        <div class="modal-card">
            <h3 class="text-danger">Delete Account?</h3>
            <p><strong>This action is irreversible.</strong> All your data (goals, journal entries, trackers) will be permanently lost.</p>
            <div class="modal-actions">
                <button class="btn-text" @click="showDeleteConfirm = false">Cancel</button>
                <button class="btn-danger" @click="handleDeleteAccount">Yes, Delete Everything</button>
            </div>
        </div>
    </div>

  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.subtitle {
  color: var(--color-text-muted);
}

.settings-grid {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 800px;
}

.card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
}

.settings-card h3 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 1rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
}

.status-active {
    color: #4cd964;
    font-weight: 500;
}

.status-canceled {
    color: #ff9500;
    font-weight: 500;
}

.status-expired {
    color: #ff3b30;
    font-weight: 500;
}

.subscription-details {
    background: rgba(255, 255, 255, 0.05);
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}

.detail-item:last-child {
    margin-bottom: 0;
}

.detail-label {
    color: var(--text-secondary);
}

.detail-value {
    color: var(--text-primary);
}

.plan-type {
    text-transform: capitalize;
    font-weight: 600;
}

.form-group small {
    display: block;
    margin-top: 0.25rem;
    color: var(--color-text-muted);
}

.input-row {
    display: flex;
    gap: 1rem;
}

input {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  padding: 0.75rem;
  border-radius: 8px;
  color: var(--color-text);
  width: 100%;
}

.input-disabled {
    background-color: var(--color-background-soft); /* Slightly clearer disabled state */
    cursor: not-allowed;
    opacity: 0.7;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.btn-secondary {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}

.btn-secondary:hover {
    background-color: var(--color-surface-hover);
}

.btn-danger {
  background-color: var(--color-danger); /* Ensure this variable exists or fallback usually red */
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-toggle {
    background-color: var(--color-surface-hover);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
}

.premium-badge {
    color: var(--color-primary);
    font-weight: 600;
    font-size: 1rem;
}

.subscription-details {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border);
}

.detail-item {
    display: flex;
    justify-content: space-between;
    margin: 0.5rem 0;
    font-size: 0.9rem;
}

.detail-label {
    color: var(--color-text-muted);
}

.detail-value {
    font-weight: 600;
    color: var(--color-text);
}

.status-active {
    color: #10b981;
}

.status-canceled {
    color: #f59e0b;
}

.status-expired {
    color: var(--color-danger);
}

.subscription-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-end;
}

.btn-manage {
    font-size: 0.875rem;
    color: var(--color-primary);
    text-decoration: none;
    padding: 0.5rem 1rem;
    border: 1px solid var(--color-primary);
    border-radius: 6px;
    transition: all 0.2s;
}

.btn-manage:hover {
    background-color: var(--color-primary);
    color: white;
}

.preference-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.pref-info h4 {
    margin: 0 0 0.25rem 0;
}

.pref-info p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-text-muted);
}

.security-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
}

.action-info h4 {
    margin: 0 0 0.25rem 0;
}

.action-info p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-text-muted);
}

.text-danger {
    color: var(--color-danger);
}

.divider {
    height: 1px;
    background-color: var(--color-border);
    margin: 1.5rem 0;
}

.feedback-msg {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: var(--color-success);
}

.feedback-msg.error {
    color: var(--color-danger);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-card {
  background-color: var(--color-surface);
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.modal-card h3 {
    margin-top: 0;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
}

.btn-text {
    background: none;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
}

.error-msg {
    color: var(--color-danger);
    font-size: 0.9rem;
    margin-top: 0.5rem;
}
</style>
