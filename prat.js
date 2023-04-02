var node_id = 1
var c_primes = [2,3]
var c_roots = {}

// Helper functions

function log(text,c="out") {
    output = document.getElementById("output");
    output.appendChild(Object.assign(document.createElement('p'),{
        innerHTML: text,
        className: c
    }))
    return;
}

function clear(html_id) {
    let ele = document.getElementById(html_id);
    while (ele.firstChild) {
      ele.removeChild(ele.lastChild);
    }
}

function load_cache() {
    if (localStorage.getItem("c_roots") === null || localStorage.getItem("c_primes") === null) {
        update_cache()
    }

    c_roots = JSON.parse(localStorage.getItem("c_roots"))
    c_primes = JSON.parse(localStorage.getItem("c_primes"))
}

function update_cache() {
    localStorage.setItem("c_roots", JSON.stringify(c_roots))
    localStorage.setItem("c_primes", JSON.stringify(c_primes))
}

////

// Generic Math Functions

function is_prime(n) {
    if (c_primes.includes(n)) { return true }
    for (let i = 2; i < Math.floor(n/2)+1; i++) {
        if (n%i == 0) {
            return false
        }
    }
    c_primes.push(Number(n))
    update_cache()
    return true
}

function get_root(n) {
    if (n in c_roots) {return c_roots[n]}
    let order = n-1
    for (let num = 1; num < n; num++) {
        let i = 1;
        while ( ((Math.pow(num,i)) % n) != 1) {
            i+=1
            if (i == n) { break; }
            if (order == i) {
                if (Math.pow(num,n-1)%n >= 2) { continue; } // Account for rounding errors
                //log(`Found primitive root ${num} for ${n}`)
                c_roots[n] = Number(num)
                update_cache()
                return num
            }
        }
    }
}

////

// Where the magic happens

function get_prime_factors(n) {
    if (n == 2) { return [2] }
    let prime_factors = []
    for (let i = 2; i < Math.floor(n/2)+1; i++) {
        if (n%i == 0) {
            if (is_prime(i)) {
                prime_factors.push(i)
            } else {
                prime_factors = prime_factors.concat(get_prime_factors(i))
            }
        }
    }
    return prime_factors
}

function prime_factorize(n) {
    if (n == 4) { return [2,2]}

    let primes = get_prime_factors(n)
    let factors = []

    primes.forEach(prime => {
        if (n%prime == 0) {
            n = n/prime
            factors.push(prime)
        }
    })

    
    return factors
}

function generate_tree(prime, parent) {
    //log(`Prime: ${prime}, Node ID: ${node_id}, Parent: ${parent}`)

    p_fs = prime_factorize(prime-1)

    let text = prime.toString()
    if (prime != 2) {
        let root = get_root(prime);
        text = `${prime}, g=${root}`
        log(`<span class="parent-log">V = ${prime}, g = ${root}</span>:`)
        log(`${prime}-1 = ${prime-1} = ${p_fs.join("x")}`)
        log(`g<span class="up l1">V-1</span> = ${root}<span class="up">${prime-1}</span> = ${Math.pow(root,prime-1)} ≅ 1 mod ${prime}`,"l1")
    
        var p_set = Array.from(new Set(p_fs));
        for (let p = 1; p <= p_set.length; p++) {
            log(`g<span class="up">V-1/p${p}</span> = ${root}<span class="up">${(prime-1)}/${p_set[p-1]}</span> = ${root}<span class="up">${(prime-1)/p_set[p-1]}</span> = ${Math.pow(root,(prime-1)/p_set[p-1])} = ${(Math.pow(root,(prime-1)/p_set[p-1]))%prime} ≢ 1 mod ${prime}`,"l2")
        }
    }

    cert.push({"id":node_id.toString(),"parent":parent.toString(),"text":text})

    var n_id = node_id
    node_id += 1
    p_fs.forEach(p => {
        generate_tree(p,n_id)
    })

}

function start() {
     // Reset
    cert = []
    node_id = 1
    clear("0")
    clear("output")


    let prime = document.getElementById("prime").value

    if (!is_prime(prime)) { 
        log(`${prime} is not a prime!`)
    } else {
        var start = Date.now();
        generate_tree(prime, "0")
        display_tree()
        var millis = Date.now() - start
        log(`Time elapsed: ${millis}ms (${millis/1000}s)`)
    }

}

function display_tree() {
    cert.forEach(node => {
        
        parent = document.getElementById(node["parent"]);

        new_node = Object.assign(document.createElement('div'),{
            id: node["id"],
            className: "node",
            innerHTML: node["text"],
        });

        parent.appendChild(new_node);

        if (node["parent"] == "0") { return; }
        parent.className = "node parent"
    });
    return;
}

function random_prime() {
    var list_o_primes = [5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997]
    var rando_prime = list_o_primes[Math.floor(Math.random()*list_o_primes.length)]
    document.getElementById("prime").value = rando_prime
    start()
}

document.addEventListener('DOMContentLoaded', function() {
    load_cache()
    start()
});
document.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("submitbtn").click();
    }
  }); 