# Unified Cross-Account Data Views

## **The Inconsistency You've Identified**

### **Current Problem:**

- **Search Results**: Show account context with switch buttons
- **Songs Table**: Only shows songs from current account
- **Projects Table**: Only shows projects from current account
- **Inconsistent UX**: Different behaviors for different views

### **User Mental Model:**

- **User expects**: "Show me ALL my songs" regardless of account
- **System does**: "Show me songs from current account only"
- **Result**: User confusion and fragmented experience

---

## **The Core Question: Account-Centric vs Content-Centric Views**

### **Current Approach: Account-Centric**

- **Songs Table**: Shows songs from current account only
- **Projects Table**: Shows projects from current account only
- **User Flow**: Switch account → See different content
- **Mental Model**: "I'm in Account A, so I see Account A's content"

### **Proposed Approach: Content-Centric**

- **Songs Table**: Shows ALL user's songs with account context
- **Projects Table**: Shows ALL user's projects with account context
- **User Flow**: See all content → Filter by account if needed
- **Mental Model**: "I see all my content, organized by account"

---

## **Content-Centric Design Benefits**

### **1. Unified User Experience:**

- **Consistent Behavior**: All views show cross-account content
- **Account Context**: All views show account information
- **Filtering**: Users can filter by account when needed
- **No Surprises**: Same behavior across all views

### **2. User Mental Model Alignment:**

- **User Expectation**: "Show me all my songs"
- **System Behavior**: Shows all songs with account context
- **Account Awareness**: User learns about account structure
- **Content Discovery**: User finds content regardless of account

### **3. Reduced Account Switching:**

- **Less Switching**: Users don't need to switch accounts to see content
- **Account Context**: Users see account information without switching
- **Efficient Workflow**: Users can work across accounts more easily
- **Better Overview**: Users get complete picture of their content

---

## **Proposed Implementation**

### **1. Enhanced Songs Table:**

```typescript
interface Song {
  id: string;
  title: string;
  artist: string | null;
  createdAt: string;
  // Account context
  accountId: string;
  accountName: string;
  accountPlan: string;
  // Contract context
  contractId?: string;
  contractName?: string;
  royaltyRate?: number;
  territory?: string;
}
```

### **2. Songs Table UI:**

```typescript
const SongsTable = () => {
  const [accountFilter, setAccountFilter] = useState<string | null>(null);
  const [showAccountDetails, setShowAccountDetails] = useState(false);

  return (
    <div className="songs-table">
      {/* Account Filter */}
      <div className="account-filter">
        <select
          value={accountFilter || ""}
          onChange={(e) => setAccountFilter(e.target.value || null)}
        >
          <option value="">All Accounts</option>
          {userAccounts.map(account => (
            <option key={account.id} value={account.id}>
              {account.name} ({account.plan})
            </option>
          ))}
        </select>
      </div>

      {/* Songs Table */}
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Artist</th>
            <th>Account</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSongs.map(song => (
            <tr key={song.id}>
              <td>{song.title}</td>
              <td>{song.artist}</td>
              <td>
                <span className="account-badge">{song.accountName}</span>
                <span className="account-plan">{song.accountPlan}</span>
              </td>
              <td>{song.createdAt}</td>
              <td>
                <button onClick={() => viewSong(song.id)}>
                  View
                </button>
                <button onClick={() => showAccountDetails(song.accountId)}>
                  Account Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### **3. Account Details Modal:**

```typescript
const AccountDetailsModal = ({ accountId, onClose }) => {
  const account = accounts.find(a => a.id === accountId);
  const accountSongs = songs.filter(s => s.accountId === accountId);
  const accountProjects = projects.filter(p => p.accountId === accountId);

  return (
    <div className="modal">
      <div className="modal-header">
        <h2>{account.name} Account Details</h2>
        <button onClick={onClose}>×</button>
      </div>

      <div className="modal-content">
        {/* Account Information */}
        <section className="account-info">
          <h3>Account Information</h3>
          <p><strong>Plan:</strong> {account.plan}</p>
          <p><strong>Status:</strong> {account.status}</p>
          <p><strong>Contract:</strong> {account.contractName}</p>
          <p><strong>Royalty Rate:</strong> {account.royaltyRate}%</p>
          <p><strong>Territory:</strong> {account.territory}</p>
        </section>

        {/* Account Content */}
        <section className="account-content">
          <h3>Songs in this Account</h3>
          <ul>
            {accountSongs.map(song => (
              <li key={song.id}>
                {song.title} - {song.artist}
              </li>
            ))}
          </ul>

          <h3>Projects in this Account</h3>
          <ul>
            {accountProjects.map(project => (
              <li key={project.id}>
                {project.name}
              </li>
            ))}
          </ul>
        </section>

        {/* Account Actions */}
        <section className="account-actions">
          <button onClick={() => switchToAccount(accountId)}>
            Switch to {account.name}
          </button>
          <button onClick={() => editAccountSettings(accountId)}>
            Edit Account Settings
          </button>
        </section>
      </div>
    </div>
  );
};
```

---

## **Account Details vs Account Switching**

### **Account Details (Information View):**

- **Purpose**: Show account information and settings
- **Content**: Account metadata, contract details, content list
- **Action**: View-only, no context switching
- **Use Case**: "What's in this account? What are the contract terms?"

### **Account Switching (Context Change):**

- **Purpose**: Change user's working context
- **Content**: Switch to account for active work
- **Action**: Changes user's current account context
- **Use Case**: "I want to work in this account"

### **Clear Separation:**

- **Account Details**: Information and settings
- **Account Switching**: Active work context
- **User Control**: User chooses when to switch contexts
- **Account Awareness**: User understands account structure

---

## **Unified Data View Architecture**

### **1. All Views Show Cross-Account Content:**

- **Songs Table**: All songs with account context
- **Projects Table**: All projects with account context
- **Search Results**: All content with account context
- **Consistent Behavior**: Same pattern across all views

### **2. Account Context Display:**

- **Account Badges**: Visual indication of account
- **Account Information**: Name, plan, status
- **Contract Details**: Royalty rates, territories
- **Content Counts**: How many songs/projects per account

### **3. Account Filtering:**

- **Filter by Account**: Show content from specific account
- **Filter by Contract**: Show content with specific contract terms
- **Filter by Territory**: Show content for specific territories
- **Clear Filters**: Reset to show all content

### **4. Account Actions:**

- **View Details**: See account information and settings
- **Switch Context**: Change to account for active work
- **Edit Settings**: Modify account configuration
- **Manage Content**: Add/remove content from account

---

## **User Experience Benefits**

### **1. Unified Experience:**

- **Consistent Behavior**: All views work the same way
- **Account Context**: All views show account information
- **No Surprises**: Users know what to expect
- **Efficient Workflow**: Users can work across accounts easily

### **2. Content Discovery:**

- **Find Everything**: Users see all their content
- **Account Awareness**: Users learn about account structure
- **Content Organization**: Users understand content relationships
- **Efficient Search**: Users find content regardless of account

### **3. Account Management:**

- **Account Overview**: Users see account information
- **Contract Details**: Users understand contract terms
- **Content Management**: Users manage content across accounts
- **Settings Control**: Users control account configuration

### **4. Reduced Cognitive Load:**

- **Less Switching**: Users don't need to switch accounts frequently
- **Account Context**: Users see account information without switching
- **Efficient Workflow**: Users can work across accounts more easily
- **Better Overview**: Users get complete picture of their content

---

## **Implementation Considerations**

### **1. Performance:**

- **Efficient Queries**: Optimize cross-account data fetching
- **Caching**: Cache account and content data
- **Pagination**: Handle large amounts of cross-account content
- **Filtering**: Efficient client-side and server-side filtering

### **2. User Interface:**

- **Account Badges**: Clear visual indication of account context
- **Filter Controls**: Easy account and contract filtering
- **Account Details**: Comprehensive account information display
- **Action Buttons**: Clear account switching and management actions

### **3. Data Architecture:**

- **Cross-Account Queries**: Efficient database queries across accounts
- **Account Context**: Include account information in all data
- **Contract Details**: Include contract information in content
- **Territory Management**: Handle territory-specific content

### **4. User Education:**

- **Account Structure**: Help users understand account organization
- **Contract Terms**: Help users understand contract details
- **Content Management**: Help users manage content across accounts
- **Account Switching**: Help users understand when to switch accounts

---

## **Conclusion**

You're absolutely right about the inconsistency. The solution is to make **all data views content-centric** rather than account-centric:

### **Key Changes:**

1. **Songs Table**: Show ALL songs with account context
2. **Projects Table**: Show ALL projects with account context
3. **Search Results**: Show ALL content with account context
4. **Account Details**: Separate information view from context switching

### **Benefits:**

- ✅ **Unified Experience**: Consistent behavior across all views
- ✅ **Content Discovery**: Users find all their content
- ✅ **Account Awareness**: Users understand account structure
- ✅ **Efficient Workflow**: Users work across accounts easily

### **Account Details vs Account Switching:**

- **Account Details**: Information and settings (view-only)
- **Account Switching**: Active work context (context change)
- **Clear Separation**: Different purposes, different actions
- **User Control**: User chooses when to switch contexts

This creates a much more intuitive and consistent user experience where users can see all their content while maintaining clear account boundaries and context switching when needed.
